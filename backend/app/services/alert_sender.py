from typing import Optional
import httpx

async def send_telegram_alert(telegram_id: str, message: str, bot_token: str) -> bool:
    """
    Telegram으로 알림 전송
    
    Args:
        telegram_id: 사용자 Telegram ID
        message: 전송할 메시지
        bot_token: Telegram Bot Token
    
    Returns:
        bool: 전송 성공 여부
    """
    if not bot_token:
        print("Telegram bot token not configured")
        return False
    
    url = f"https://api.telegram.org/bot{bot_token}/sendMessage"
    payload = {
        "chat_id": telegram_id,
        "text": message,
        "parse_mode": "Markdown"
    }
    
    try:
        async with httpx.AsyncClient() as client:
            response = await client.post(url, json=payload)
            return response.status_code == 200
    except Exception as e:
        print(f"Error sending Telegram alert: {e}")
        return False

async def send_email_alert(email: str, subject: str, body: str, sendgrid_key: str) -> bool:
    """
    SendGrid로 이메일 알림 전송
    
    Args:
        email: 수신자 이메일
        subject: 제목
        body: 내용
        sendgrid_key: SendGrid API 키
    
    Returns:
        bool: 전송 성공 여부
    """
    if not sendgrid_key:
        print("SendGrid API key not configured")
        return False
    
    url = "https://api.sendgrid.com/v3/mail/send"
    headers = {
        "Authorization": f"Bearer {sendgrid_key}",
        "Content-Type": "application/json"
    }
    payload = {
        "personalizations": [{"to": [{"email": email}]}],
        "from": {"email": "noreply@stockalerts.com"},
        "subject": subject,
        "content": [{"type": "text/plain", "value": body}]
    }
    
    try:
        async with httpx.AsyncClient() as client:
            response = await client.post(url, headers=headers, json=payload)
            return response.status_code == 202
    except Exception as e:
        print(f"Error sending email alert: {e}")
        return False

async def send_alert(user: dict, news: dict, alert_type: str, config: dict) -> bool:
    """
    사용자에게 알림 전송
    
    Args:
        user: 사용자 정보
        news: 뉴스 정보
        alert_type: 알림 유형 (telegram, email, push)
        config: 설정 (bot_token, sendgrid_key 등)
    
    Returns:
        bool: 전송 성공 여부
    """
    message = f"📰 *Stock News Alert*\n\n{news['title']}\n\nImpact Score: {news.get('impact_score', 'N/A')}/5\n\n{news.get('summary', '')}\n\nRead more: {news.get('url', '')}"
    
    if alert_type == "telegram" and user.get("telegram_id"):
        return await send_telegram_alert(
            user["telegram_id"],
            message,
            config.get("telegram_bot_token", "")
        )
    
    elif alert_type == "email":
        return await send_email_alert(
            user["email"],
            f"Stock Alert: {news['title']}",
            message,
            config.get("sendgrid_api_key", "")
        )
    
    return False
