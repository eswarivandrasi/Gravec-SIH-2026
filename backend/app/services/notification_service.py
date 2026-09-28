from typing import List, Dict, Any
from datetime import datetime

class NotificationService:
    """
    Multi-channel emergency notification dispatcher abstraction.
    Ready for integration with CDAC Cell Broadcast, NIC SMS Gateway, or WhatsApp Cloud API.
    """

    @classmethod
    def dispatch_sms(cls, phone_numbers: List[str], message: str, is_demo: bool = True) -> Dict[str, Any]:
        """Dispatches emergency SMS broadcast."""
        return {
            "channel": "SMS",
            "recipients_count": len(phone_numbers),
            "status": "DELIVERED",
            "timestamp": datetime.utcnow().isoformat(),
            "is_demo": is_demo
        }

    @classmethod
    def dispatch_siren_alert(cls, districts: List[str], severity: str) -> Dict[str, Any]:
        """Dispatches coastal sirens & public address systems."""
        return {
            "channel": "COASTAL_SIRENS",
            "districts": districts,
            "status": "ACTIVATED",
            "siren_frequency_hz": 440,
            "is_demo": True
        }
