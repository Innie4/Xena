import unittest
from unittest.mock import patch

from app.routers.users import bvn_lookup, BvnLookupRequest


class FakeResult:
    def __init__(self, data):
        self.data = data


class FakeSingleResult:
    def __init__(self, data):
        self.data = data


class FakeQuery:
    def __init__(self, table_name, record_rows, account_rows):
        self.table_name = table_name
        self.record_rows = record_rows
        self.account_rows = account_rows
        self.select_columns = None
        self.eq_values = []
        self.single_called = False

    def select(self, columns):
        self.select_columns = columns
        return self

    def eq(self, column, value):
        self.eq_values.append((column, value))
        return self

    def single(self):
        self.single_called = True
        return self

    def execute(self):
        if self.table_name == "bvn_records":
            if self.single_called:
                return FakeSingleResult(self.record_rows[0] if self.record_rows else None)
            return FakeResult(self.record_rows)
        if self.table_name == "bvn_accounts":
            return FakeResult(self.account_rows)
        return FakeResult([])


class FakeSupabase:
    def __init__(self, record_rows, account_rows):
        self.record_rows = record_rows
        self.account_rows = account_rows
        self.last_query = None

    def table(self, table_name):
        query = FakeQuery(table_name, self.record_rows, self.account_rows)
        self.last_query = query
        return query


class BvnLookupTests(unittest.TestCase):
    def test_lookup_uses_only_columns_available_on_live_schema(self):
        fake_supabase = FakeSupabase(
            record_rows=[{"bvn": "22212345671", "phone_number": "+2348023456701", "full_name": "Uduak Udo"}],
            account_rows=[{"bank_name": "Access Bank", "account_number": "0982571862", "account_name": "Uduak Udo"}],
        )

        with patch("app.routers.users.supabase", fake_supabase):
            response = bvn_lookup(BvnLookupRequest(bvn="22212345671"))

        self.assertEqual(response.phone_number, "+2348023456701")
        self.assertEqual(response.full_name, "Uduak Udo")
        self.assertEqual(len(response.accounts), 1)
        self.assertEqual(response.accounts[0].bank_name, "Access Bank")
        self.assertEqual(response.accounts[0].provider, "")
        self.assertEqual(fake_supabase.last_query.select_columns, "bank_name, account_number, account_name")


if __name__ == "__main__":
    unittest.main()
