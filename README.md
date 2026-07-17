# Xena

Xena helps neighbours on a street collect money together for the things they share, like trash pickup, gutter clearing, and waste packing. One person no longer has to chase others in a WhatsApp group.

## Team

**Project name:** Xena

Built by:
- Inimfon Udoh
- Mene Gideon
- Imeobong Monday

## The problem

On many streets, collecting contributions is slow and stressful. Someone sends messages asking who has paid, people forget, and the work stops because the money is missing. There is no clear view of who has given, how much is in the pot, or when the next job will happen. Trust drops, and the street falls behind on basic upkeep.

## The fix

Xena puts the collection on autopilot. A neighbour signs up with a name and phone number, picks their street, and the app opens a Community Wallet for that street. Smart Sweep gathers small amounts on a steady rhythm, so bills clear without anyone asking twice. Every naira is shown to everyone, and the street builds a streak and a standing score as it keeps up.

## What you can do in the app

- Sign up with your name, phone number, and house address, then pick your street by typing it, using your location, or dropping a pin on a map.
- Log in and jump straight back into your street wallet.
- Link your banks from your profile. Turn on the Open Banking toggle, enter your BVN, and pick the accounts you want to connect. The app simulates six linked banks so the flow is easy to show.
- See your wallet balance, your street standing, and a preview of bills and community projects on the home screen.
- Pay bills, set up Smart Sweep on a bill, and turn on Payment Timing so bills land when your balance is healthy.
- Open community projects, give to them, propose new ones, and vote on what the street should fund next.
- Earn sparks, levels, ranks, and badges as you keep the fire lit.

## How to run it

You need Node.js installed. Then run these commands from the project folder.

```
npm install
npm run dev
```

The app opens at http://localhost:5173.

To build for production:

```
npm run build
```

To run the tests:

```
npm test
```

## How the screens fit together

- Landing page tells the story and has buttons to sign up, log in, or peek inside.
- Sign up walks through name, phone, address, code check, and street pick.
- Log in returns you to the demo account.
- Home shows your wallet, standing, bills, and community preview.
- Bills, Community, Vote, Notifications, and Profile each handle one part of street life.
- The Profile screen holds the Open Banking toggle where you link your banks.

## A note on the demo

This is a frontend-only demo. All data is fictional and lives in the app, so you can click through every screen without a server. The bank linking is simulated to keep the hackathon demo simple and fast to show.
