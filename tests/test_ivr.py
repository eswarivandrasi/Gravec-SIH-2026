import sys
import os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", "backend"))

import pytest
from app.services.ivr_service import MockTelephonyProvider, TelephonyProvider

def test_mock_telephony_provider_interface():
    provider = MockTelephonyProvider()
    assert isinstance(provider, TelephonyProvider)

    # 1. Initiate Call
    call = provider.make_call(
        to_phone="+919876543212",
        recipient_name="Praveen Kumar",
        language="telugu",
        context={"cyclone_name": "VAYU-26", "district": "Visakhapatnam"}
    )
    assert "call_sid" in call
    assert call["status"] == "IN_PROGRESS"
    assert call["language"] == "telugu"
    assert "నమస్కారం" in call["voice_prompt"]

    # 2. Keypad DTMF - Press 1 (Repeat)
    res_1 = provider.collect_digits(call["call_sid"], "1", "telugu")
    assert res_1["action_taken"] == "REPEAT_ALERT"
    assert "తుఫాను" in res_1["voice_prompt"]

    # 3. Keypad DTMF - Press 2 (Safety tips)
    res_2 = provider.collect_digits(call["call_sid"], "2", "telugu")
    assert res_2["action_taken"] == "PLAY_SAFETY_INSTRUCTIONS"

    # 4. Keypad DTMF - Press 3 (Shelter info)
    res_3 = provider.collect_digits(call["call_sid"], "3", "telugu")
    assert res_3["action_taken"] == "PLAY_SHELTER_INFO"

    # 5. Language Switching to Hindi
    res_lang = provider.collect_digits(call["call_sid"], "lang_hi", "telugu")
    assert res_lang["language"] == "hindi"
    assert "नमस्ते" in res_lang["voice_prompt"]

    # 6. End Call
    res_end = provider.collect_digits(call["call_sid"], "5", "hindi")
    assert res_end["status"] == "COMPLETED"
