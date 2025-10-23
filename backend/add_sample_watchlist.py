import asyncio
import httpx

async def add_sample_watchlist():
    """Add sample stocks to watchlist"""

    user_id = "00000000-0000-0000-0000-000000000001"

    # Sample stocks to add
    stocks = [
        {"ticker": "AAPL", "alert_threshold": 3},
        {"ticker": "TSLA", "alert_threshold": 4},
        {"ticker": "NVDA", "alert_threshold": 5},
        {"ticker": "MSFT", "alert_threshold": 2},
        {"ticker": "GOOGL", "alert_threshold": 3},
    ]

    async with httpx.AsyncClient() as client:
        for stock in stocks:
            try:
                response = await client.post(
                    f"http://localhost:8000/api/users/{user_id}/stocks",
                    json=stock
                )
                if response.status_code == 200:
                    print(f"✅ Added {stock['ticker']} to watchlist (Alert Level: {stock['alert_threshold']})")
                else:
                    print(f"❌ Failed to add {stock['ticker']}: {response.text}")
            except Exception as e:
                print(f"❌ Error adding {stock['ticker']}: {e}")

if __name__ == "__main__":
    print("Adding sample stocks to watchlist...")
    asyncio.run(add_sample_watchlist())
    print("\n✅ Done! Check http://localhost:3000/watchlist")
