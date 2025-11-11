# Email Notification Examples

## How Names Are Extracted and Used

### Name Extraction Logic
When a user logs in with an email like `harry.potter123@gmail.com`:
1. Extract local part: `harry.potter123`
2. Remove numbers: `harry.potter`
3. Split by dots/underscores: `['harry', 'potter']`
4. Take first part: `harry`
5. Capitalize: `Harry`

### Email Examples

#### Example 1: User with firstName from OAuth
**User:** John Doe (john.doe@gmail.com)
**firstName:** John (from Google OAuth)

```
Subject: FindersKeepers: AI Found a Potential Match!

Hi John,

Great news! Our AI system found a 85% match for your lost item.

Your Item: "Black iPhone 14"
Matched With: "iPhone found at Central Park"

Match Details:
- Category: Electronics
- Location: Central Park, NYC
- Date: 11/5/2025
- Posted: 11/5/2025, 6:48 PM

Contact Information:
- Name: Sarah Smith
- Phone: 555-1234
- Email: sarah@example.com
- User Email: sarah.smith@gmail.com

Visit FindersKeepers to view photos and connect with the poster.

Good luck reuniting with your item!
- The FindersKeepers Team
```

#### Example 2: User without firstName (extracted from email)
**User:** harry.potter123@gmail.com
**firstName:** Harry (extracted from email)

```
Subject: FindersKeepers: Your Post Matched!

Hi Harry,

Good news! Your found item "Wallet found at Times Square" matched with an existing lost item.

Matched Item: "Black leather wallet"
Location: Times Square, NYC
Date: 11/4/2025

Contact Information:
- Name: Mike Johnson
- Phone: 555-5678
- Email: mike@example.com
- User Email: mike.johnson@yahoo.com

Visit FindersKeepers to view details and connect.

- The FindersKeepers Team
```

#### Example 3: User with email like alex2024@outlook.com
**User:** alex2024@outlook.com
**firstName:** Alex (extracted from email)

```
Subject: FindersKeepers: AI Found a Potential Match!

Hi Alex,

Great news! Our AI system found a 92% match for your found item.

Your Item: "Keys found at Starbucks"
Matched With: "Lost car keys"

Match Details:
- Category: Keys
- Location: Starbucks, 5th Avenue
- Date: 11/5/2025
- Posted: 11/5/2025, 7:00 PM

Contact Information:
- Name: Emma Wilson
- Phone: 555-9999
- User Email: emma.wilson@gmail.com

Visit FindersKeepers to view photos and connect with the poster.

Good luck reuniting with your item!
- The FindersKeepers Team
```

## Name Extraction Examples

| Email Address | Extracted Name |
|---------------|----------------|
| harry.potter@gmail.com | Harry |
| john_doe123@yahoo.com | John |
| sarah-smith@outlook.com | Sarah |
| alex2024@gmail.com | Alex |
| mike.johnson@company.com | Mike |
| emma_w@hotmail.com | Emma |
| test123@test.com | Test |
| 123user@gmail.com | User (fallback) |

## Fallback Behavior

If no name can be extracted:
```
Hi there,

Great news! Our AI system found a potential match...
```
