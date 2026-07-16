"""
Xena — users & estates router.

Endpoints
---------
POST /users/bvn-lookup   → look up BVN in bvn_records / bvn_accounts tables
GET  /estates/search     → query estates table (ilike on name, optional city)
POST /users              → create user + primary bank account; handles duplicate phone
"""

from typing import Optional

from fastapi import APIRouter, HTTPException, Query
from pydantic import BaseModel

from app.database import supabase

router = APIRouter()


# ---------------------------------------------------------------------------
# Pydantic models
# ---------------------------------------------------------------------------

class BvnLookupRequest(BaseModel):
    bvn: str


class BankAccountItem(BaseModel):
    bank_name: str
    account_number: str
    account_name: str
    provider: str


class BvnLookupResponse(BaseModel):
    phone_number: str
    full_name: str
    accounts: list[BankAccountItem]


class EstateItem(BaseModel):
    id: str
    name: str
    city: str


class EstateSearchResponse(BaseModel):
    estates: list[EstateItem]


class SelectedAccount(BaseModel):
    bank_name: str
    account_number: str
    account_name: str
    provider: str


class CreateUserRequest(BaseModel):
    phone_number: str
    full_name: str
    estate_id: str
    selected_account: SelectedAccount


class CreatedUser(BaseModel):
    id: str
    phone_number: str
    full_name: str
    estate_id: str
    reliability_score: int
    standing_tier: str
    sweep_fee_percent: float


class CreatedBankAccount(BaseModel):
    id: str
    user_id: str
    bank_name: str
    account_number: str
    account_name: str
    provider: str
    is_primary: bool


class CreateUserResponse(BaseModel):
    user: CreatedUser
    bank_account: CreatedBankAccount


# ---------------------------------------------------------------------------
# POST /users/bvn-lookup
# ---------------------------------------------------------------------------

@router.post("/users/bvn-lookup", response_model=BvnLookupResponse)
def bvn_lookup(body: BvnLookupRequest):
    digits = body.bvn.replace(" ", "").strip()

    if len(digits) != 11 or not digits.isdigit():
        raise HTTPException(status_code=400, detail="BVN must be exactly 11 digits.")

    # ── 1. Look up the BVN record ───────────────────────────────────────────
    try:
        record_result = (
            supabase.table("bvn_records")
            .select("bvn, phone_number, full_name")
            .eq("bvn", digits)
            .single()
            .execute()
        )
    except Exception as exc:
        exc_str = str(exc)
        # PostgREST returns a 406 / PGRST116 when .single() finds no rows
        if "PGRST116" in exc_str or "406" in exc_str or "JSON object requested" in exc_str:
            raise HTTPException(
                status_code=404,
                detail="No accounts found for this BVN. Please check the number and try again.",
            )
        raise HTTPException(status_code=500, detail=f"Database error: {exc}")

    bvn_record = record_result.data
    if not bvn_record:
        raise HTTPException(
            status_code=404,
            detail="No accounts found for this BVN. Please check the number and try again.",
        )

    # ── 2. Fetch linked bank accounts ───────────────────────────────────────
    try:
        accounts_result = (
            supabase.table("bvn_accounts")
            .select("bank_name, account_number, account_name, provider")
            .eq("bvn", digits)
            .execute()
        )
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"Database error fetching accounts: {exc}")

    rows = accounts_result.data or []
    if not rows:
        raise HTTPException(
            status_code=404,
            detail="No accounts found for this BVN. Please check the number and try again.",
        )

    accounts = [
        BankAccountItem(
            bank_name=row["bank_name"],
            account_number=row["account_number"],
            account_name=row["account_name"],
            provider=row["provider"],
        )
        for row in rows
    ]

    return BvnLookupResponse(
        phone_number=bvn_record["phone_number"],
        full_name=bvn_record["full_name"],
        accounts=accounts,
    )


# ---------------------------------------------------------------------------
# GET /estates/search
# ---------------------------------------------------------------------------

@router.get("/estates/search", response_model=EstateSearchResponse)
def search_estates(
    q: str = Query(default="", description="Search term matched against estate name"),
    city: Optional[str] = Query(default=None, description="Optional city filter"),
):
    try:
        query = supabase.table("estates").select("id, name, city")

        if q.strip():
            query = query.ilike("name", f"%{q.strip()}%")

        if city:
            query = query.eq("city", city)

        # When q is empty return most-recently-added estates (created_at desc)
        if not q.strip():
            query = query.order("created_at", desc=True)

        query = query.limit(5)
        result = query.execute()

    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"Database error: {exc}")

    estates = [
        EstateItem(id=row["id"], name=row["name"], city=row["city"])
        for row in (result.data or [])
    ]
    return EstateSearchResponse(estates=estates)


# ---------------------------------------------------------------------------
# POST /users
# ---------------------------------------------------------------------------

@router.post("/users", response_model=CreateUserResponse, status_code=201)
def create_user(body: CreateUserRequest):
    # ── 1. Attempt to insert the user ──────────────────────────────────────
    user_payload = {
        "phone_number":     body.phone_number,
        "full_name":        body.full_name,
        "estate_id":        body.estate_id,
        "reliability_score": 15,
        "standing_tier":    "Newcomer",
        "sweep_fee_percent": 5.00,
    }

    try:
        user_result = supabase.table("users").insert(user_payload).execute()
    except Exception as exc:
        # ── Duplicate phone → fetch existing user instead of erroring ──────
        exc_str = str(exc).lower()
        if "duplicate" in exc_str or "unique" in exc_str or "23505" in exc_str:
            return _fetch_existing_user(body.phone_number, body.selected_account)
        raise HTTPException(status_code=500, detail=f"Failed to create user: {exc}")

    if not user_result.data:
        raise HTTPException(status_code=500, detail="User insert returned no data.")

    created_user = user_result.data[0]
    user_id = created_user["id"]

    # ── 2. Insert the primary bank account ─────────────────────────────────
    account_payload = {
        "user_id":        user_id,
        "bank_name":      body.selected_account.bank_name,
        "account_number": body.selected_account.account_number,
        "account_name":   body.selected_account.account_name,
        "provider":       body.selected_account.provider,
        "is_primary":     True,
    }

    try:
        account_result = supabase.table("bank_accounts").insert(account_payload).execute()
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"Failed to create bank account: {exc}")

    if not account_result.data:
        raise HTTPException(status_code=500, detail="Bank account insert returned no data.")

    created_account = account_result.data[0]

    return CreateUserResponse(
        user=CreatedUser(**{
            "id":               created_user["id"],
            "phone_number":     created_user["phone_number"],
            "full_name":        created_user["full_name"],
            "estate_id":        created_user["estate_id"],
            "reliability_score": created_user["reliability_score"],
            "standing_tier":    created_user["standing_tier"],
            "sweep_fee_percent": float(created_user["sweep_fee_percent"]),
        }),
        bank_account=CreatedBankAccount(**{
            "id":             created_account["id"],
            "user_id":        created_account["user_id"],
            "bank_name":      created_account["bank_name"],
            "account_number": created_account["account_number"],
            "account_name":   created_account["account_name"],
            "provider":       created_account["provider"],
            "is_primary":     created_account["is_primary"],
        }),
    )


def _fetch_existing_user(
    phone_number: str,
    selected_account: SelectedAccount,
) -> CreateUserResponse:
    """
    Called when POST /users hits a duplicate phone_number.
    Returns the existing user + their primary bank account (or the one being
    submitted if no primary exists yet).
    """
    try:
        user_result = (
            supabase.table("users")
            .select("*")
            .eq("phone_number", phone_number)
            .single()
            .execute()
        )
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"Could not fetch existing user: {exc}")

    existing_user = user_result.data
    user_id = existing_user["id"]

    # Try to find existing primary bank account
    try:
        acct_result = (
            supabase.table("bank_accounts")
            .select("*")
            .eq("user_id", user_id)
            .eq("is_primary", True)
            .limit(1)
            .execute()
        )
        accounts = acct_result.data or []
    except Exception:
        accounts = []

    if accounts:
        acct = accounts[0]
    else:
        # No primary account found — use the one being submitted
        acct = {
            "id":             "temp-" + user_id,
            "user_id":        user_id,
            "bank_name":      selected_account.bank_name,
            "account_number": selected_account.account_number,
            "account_name":   selected_account.account_name,
            "provider":       selected_account.provider,
            "is_primary":     True,
        }

    return CreateUserResponse(
        user=CreatedUser(**{
            "id":                existing_user["id"],
            "phone_number":      existing_user["phone_number"],
            "full_name":         existing_user["full_name"],
            "estate_id":         existing_user["estate_id"],
            "reliability_score": existing_user.get("reliability_score", 15),
            "standing_tier":     existing_user.get("standing_tier", "Newcomer"),
            "sweep_fee_percent": float(existing_user.get("sweep_fee_percent", 5.00)),
        }),
        bank_account=CreatedBankAccount(**{
            "id":             acct["id"],
            "user_id":        acct["user_id"],
            "bank_name":      acct["bank_name"],
            "account_number": acct["account_number"],
            "account_name":   acct["account_name"],
            "provider":       acct["provider"],
            "is_primary":     acct["is_primary"],
        }),
    )
