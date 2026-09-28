import uuid
from abc import ABC, abstractmethod
from typing import Dict, Any, List, Optional
from datetime import datetime
from app.config import settings

class TelephonyProvider(ABC):
    """
    Abstract Telephony Interface.
    Ready to connect with Twilio, Exotel, Airtel IQ, or Reliance Jio Cloud IVR in production.
    """

    @abstractmethod
    def make_call(self, to_phone: str, recipient_name: str, language: str, context: Dict[str, Any]) -> Dict[str, Any]:
        pass

    @abstractmethod
    def play_message(self, call_sid: str, message: str, language: str) -> Dict[str, Any]:
        pass

    @abstractmethod
    def collect_digits(self, call_sid: str, digit: str, current_language: str, context: Dict[str, Any]) -> Dict[str, Any]:
        pass

    @abstractmethod
    def end_call(self, call_sid: str) -> Dict[str, Any]:
        pass


class MockTelephonyProvider(TelephonyProvider):
    """
    Simulated Telephony Provider for Demo Mode & Hackathon Presentation.
    Simulates complete non-smartphone keypad IVR call flow in Telugu, Hindi, and English.
    Note: Simulated IVR in Demo Mode. Does not place actual GSM carrier phone calls.
    """

    # Static multi-lingual voice copy
    IVR_COPY = {
        "english": {
            "initial_call": (
                "Namaste. This is the CycloneFusion emergency alert system. "
                "Cyclone VAYU-26 is currently being monitored. "
                "Please listen carefully. "
                "Press 1 to repeat the emergency alert. "
                "Press 2 for safety instructions. "
                "Press 3 for nearest shelter information. "
                "Press 4 to change language. "
                "Press 5 to end the call."
            ),
            "menu_prompt": (
                "Press 1 to repeat the emergency alert. "
                "Press 2 for safety instructions. "
                "Press 3 for nearest shelter information. "
                "Press 4 to change language. "
                "Press 5 to end the call."
            ),
            "key_1_alert": (
                "Emergency alert for Cyclone VAYU-26. "
                "The cyclone is currently classified as a Very Severe Cyclonic Storm. "
                "Current wind speed is 145 kilometres per hour. "
                "Central pressure is 968 hectopascals. "
                "The cyclone is moving north-northwest at approximately 16 kilometres per hour. "
                "The predicted landfall region is between Visakhapatnam and Puri. "
                "Please follow official safety instructions."
            ),
            "key_2_safety": (
                "Safety instructions. "
                "Stay indoors and stay away from windows. "
                "Keep drinking water, medicines and emergency supplies ready. "
                "Charge your mobile phone. "
                "Follow evacuation instructions from local authorities. "
                "Do not travel through flooded roads. "
                "Move to a designated shelter if instructed."
            ),
            "key_4_language_menu": (
                "Language selection. "
                "Press 1 for Telugu. "
                "Press 2 for Hindi. "
                "Press 3 for English."
            ),
            "language_switched": "Language set to English.",
            "key_5_end": (
                "Thank you. Please stay safe and follow official cyclone warnings."
            ),
            "shelter_unavailable": (
                "Nearest shelter information is currently unavailable. "
                "Please follow instructions from local authorities."
            )
        },
        "telugu": {
            "initial_call": (
                "నమస్కారం. ఇది సైక్లోన్ ఫ్యూజన్ అత్యవసర హెచ్చరిక విభాగం. "
                "వాయు-26 తుఫానును ప్రస్తుతం నిరంతరం పర్యవేక్షిస్తున్నాము. "
                "దయచేసి శ్రద్ధగా వినండి. "
                "అత్యవసర హెచ్చరికను మళ్లీ వినడానికి 1 నొక్కండి. "
                "రక్షణ సూచనల కోసం 2 నొక్కండి. "
                "సమీప పునరావాస కేంద్రం సమాచారం కోసం 3 నొక్కండి. "
                "భాష మార్చుకోవడానికి 4 నొక్కండి. "
                "కాల్ ముగించడానికి 5 నొక్కండి."
            ),
            "menu_prompt": (
                "హెచ్చరికను మళ్లీ వినడానికి 1 నొక్కండి. "
                "రక్షణ సూచనల కోసం 2 నొక్కండి. "
                "సమీప పునరావాస కేంద్రం కోసం 3 నొక్కండి. "
                "భాష మార్చుకోవడానికి 4 నొక్కండి. "
                "కాల్ ముగించడానికి 5 నొక్కండి."
            ),
            "key_1_alert": (
                "వాయు-26 తుఫాను అత్యవసర హెచ్చరిక. "
                "ఈ తుఫాను ప్రస్తుతం అతి తీవ్ర తుఫానుగా వర్గీకరించబడింది. "
                "ప్రస్తుత గాలి వేగం గంటకు 145 కిలోమీటర్లు. "
                "కేంద్ర వాయుపీడనం 968 హెక్టోపాస్కల్స్. "
                "తుఫాను ఉత్తర-వాయవ్య దిశగా గంటకు 16 కిలోమీటర్ల వేగంతో కదులుతోంది. "
                "విశాఖపట్నం మరియు పూరీ మధ్య తీరం దాటే అవకాశం ఉంది. "
                "దయచేసి అధికారిక రక్షణ సూచనలను పాటించండి."
            ),
            "key_2_safety": (
                "రక్షణ సూచనలు. "
                "ఇళ్లలోనే సురక్షితంగా ఉండండి మరియు కిటికీలకు దూరంగా ఉండండి. "
                "త్రాగునీరు, మందులు మరియు అత్యవసర సామాగ్రి సిద్ధంగా ఉంచుకోండి. "
                "మీ మొబైల్ ఫోన్‌ను చార్జ్ చేసుకోండి. "
                "స్థానిక అధికారుల తరలింపు ఆదేశాలను పాటించండి. "
                "వరద నీటిలో ప్రయాణించవద్దు. "
                "అధికారులు సూచిస్తే సమీప పునరావాస కేంద్రానికి తరలివెళ్లండి."
            ),
            "key_4_language_menu": (
                "భాష ఎంపిక. "
                "తెలుగు కోసం 1 నొక్కండి. "
                "హిందీ కోసం 2 నొక్కండి. "
                "ఇంగ్లీష్ కోసం 3 నొక్కండి."
            ),
            "language_switched": "భాష తెలుగుగా మార్చబడింది.",
            "key_5_end": (
                "ధన్యవాదాలు. దయచేసి సురక్షితంగా ఉండండి మరియు అధికారిక తుఫాను హెచ్చరికలను పాటించండి."
            ),
            "shelter_unavailable": (
                "సమీప పునరావాస కేంద్ర సమాచారం ప్రస్తుతం అందుబాటులో లేదు. "
                "దయచేసి స్థానిక అధికారుల సూచనలను పాటించండి."
            )
        },
        "hindi": {
            "initial_call": (
                "नमस्ते। यह साइक्लोनफ्यूजन आपातकालीन चेतावनी प्रणाली है। "
                "चक्रवात वायु-26 पर वर्तमान में कड़ी निगरानी रखी जा रही है। "
                "कृपया ध्यान से सुनें। "
                "आपातकालीन चेतावनी दोबारा सुनने के लिए 1 दबाएं। "
                "सुरक्षा निर्देशों के लिए 2 दबाएं। "
                "निकटतम राहत केंद्र की जानकारी के लिए 3 दबाएं। "
                "भाषा बदलने के लिए 4 दबाएं। "
                "कॉल समाप्त करने के लिए 5 दबाएं।"
            ),
            "menu_prompt": (
                "चेतावनी दोबारा सुनने के लिए 1 दबाएं। "
                "सुरक्षा निर्देशों के लिए 2 दबाएं। "
                "निकटतम राहत केंद्र के लिए 3 दबाएं। "
                "भाषा बदलने के लिए 4 दबाएं। "
                "कॉल समाप्त करने के लिए 5 दबाएं।"
            ),
            "key_1_alert": (
                "चक्रवात वायु-26 की आपातकालीन चेतावनी। "
                "इस चक्रवात को वर्तमान में अत्यंत तीव्र चक्रवाती तूफान के रूप में वर्गीकृत किया गया है। "
                "वर्तमान हवा की गति 145 किलोमीटर प्रति घंटा है। "
                "केंद्रीय वायुमंडलीय दबाव 968 हेक्टोपास्कल है। "
                "चक्रवात उत्तर-उत्तरपश्चिम दिशा में लगभग 16 किलोमीटर प्रति घंटा की गति से बढ़ रहा है। "
                "विशाखापत्तनम और पुरी के बीच भूस्खलन होने का अनुमान है। "
                "कृपया आधिकारिक सुरक्षा निर्देशों का पालन करें।"
            ),
            "key_2_safety": (
                "सुरक्षा निर्देश। "
                "घर के अंदर रहें और खिड़कियों से दूर रहें। "
                "पीने का पानी, दवाइयां और आपातकालीन आपूर्ति तैयार रखें। "
                "अपने मोबाइल फोन को चार्ज रखें। "
                "स्थानीय अधिकारियों के निकासी निर्देशों का पालन करें। "
                "जलभराव वाली सड़कों पर यात्रा न करें। "
                "निर्देश मिलने पर तुरंत निर्दिष्ट राहत शिविर में जाएं।"
            ),
            "key_4_language_menu": (
                "भाषा चयन। "
                "तेलुगु के लिए 1 दबाएं। "
                "हिंदी के लिए 2 दबाएं। "
                "अंग्रेजी के लिए 3 दबाएं।"
            ),
            "language_switched": "भाषा बदलकर हिंदी कर दी गई है।",
            "key_5_end": (
                "धन्यवाद। कृपया सुरक्षित रहें और आधिकारिक चक्रवात चेतावनियों का पालन करें।"
            ),
            "shelter_unavailable": (
                "निकटतम राहत केंद्र की जानकारी वर्तमान में उपलब्ध नहीं है। "
                "कृपया स्थानीय प्रशासन के निर्देशों का पालन करें।"
            )
        }
    }

    def _get_shelter_text(self, shelter: Any, lang: str) -> str:
        """Builds meaningful shelter speech from the real application shelter model."""
        if not shelter:
            return self.IVR_COPY[lang]["shelter_unavailable"]

        name = getattr(shelter, "name", "District Cyclone Shelter")
        address = getattr(shelter, "address", "Near Coastal Road")
        capacity = getattr(shelter, "capacity", 800)
        occupancy = getattr(shelter, "current_occupancy", 140)
        available = max(0, capacity - occupancy)
        phone = getattr(shelter, "contact_phone", "0891-2564890")

        if lang == "telugu":
            return (
                f"సమీప పునరావాస కేంద్రం: {name}, {address}, సుమారు 4.2 కిలోమీటర్ల దూరం. "
                f"మొత్తం సామర్థ్యం {capacity} మంది, ప్రస్తుతం {available} ఖాళీలు ఉన్నాయి. "
                f"సంప్రదించవలసిన ఫోన్ నంబర్: {phone}. అత్యవసర హెల్ప్‌లైన్: 1070."
            )
        elif lang == "hindi":
            return (
                f"निकटतम राहत केंद्र: {name}, {address}, लगभग 4.2 किलोमीटर दूर। "
                f"कुल क्षमता {capacity} लोग, वर्तमान में {available} स्थान उपलब्ध हैं। "
                f"संपर्क फोन: {phone}। आपातकालीन हेल्पलाइन: 1070।"
            )
        else: # english
            return (
                f"Nearest shelter: {name}, located at {address}, approximately 4.2 kilometres away. "
                f"Current capacity is {capacity} with {available} spaces available. "
                f"Contact phone {phone}. Emergency helpline: 1070."
            )

    def make_call(self, to_phone: str, recipient_name: str, language: str, context: Dict[str, Any]) -> Dict[str, Any]:
        call_sid = f"CA-CYC-{uuid.uuid4().hex[:8].upper()}"
        lang = language.lower() if language and language.lower() in self.IVR_COPY else "english"
        copy = self.IVR_COPY[lang]

        voice_text = copy["initial_call"]

        return {
            "call_sid": call_sid,
            "to_phone": to_phone,
            "recipient_name": recipient_name,
            "language": lang,
            "status": "IN_PROGRESS",
            "voice_prompt": voice_text,
            "audio_transcript_en": self.IVR_COPY["english"]["initial_call"],
            "audio_transcript_te": self.IVR_COPY["telugu"]["initial_call"],
            "audio_transcript_hi": self.IVR_COPY["hindi"]["initial_call"],
            "next_options": [
                {"digit": "1", "label": "Repeat Alert"},
                {"digit": "2", "label": "Safety Instructions"},
                {"digit": "3", "label": "Nearest Shelter Info"},
                {"digit": "4", "label": "Change Language (Telugu/Hindi/English)"},
                {"digit": "5", "label": "End Emergency Call"}
            ],
            "is_demo": True,
            "provider_type": "MockTelephonyProvider (Simulated Emergency Voice Alert for Demo)"
        }

    def play_message(self, call_sid: str, message: str, language: str) -> Dict[str, Any]:
        return {
            "call_sid": call_sid,
            "message": message,
            "language": language,
            "status": "PLAYING"
        }

    def collect_digits(self, call_sid: str, digit: str, current_language: str, context: Dict[str, Any] = None) -> Dict[str, Any]:
        ctx = context or {}
        lang = current_language.lower() if current_language and current_language.lower() in self.IVR_COPY else "english"
        copy = self.IVR_COPY[lang]

        status = "IN_PROGRESS"
        action = ""
        voice_prompt = ""

        # Normalize language selection digits
        if digit in ["lang_1", "lang_te"]:
            digit = "lang_te"
        elif digit in ["lang_2", "lang_hi"]:
            digit = "lang_hi"
        elif digit in ["lang_3", "lang_en"]:
            digit = "lang_en"

        if digit == "1":
            action = "REPEAT_ALERT"
            voice_prompt = f"{copy['key_1_alert']} ... {copy['menu_prompt']}"
        elif digit == "2":
            action = "PLAY_SAFETY_INSTRUCTIONS"
            voice_prompt = f"{copy['key_2_safety']} ... {copy['menu_prompt']}"
        elif digit == "3":
            action = "PLAY_SHELTER_INFO"
            shelter = ctx.get("shelter")
            shelter_speech = self._get_shelter_text(shelter, lang)
            voice_prompt = f"{shelter_speech} ... {copy['menu_prompt']}"
        elif digit == "4":
            action = "LANGUAGE_SELECTION_MENU"
            voice_prompt = copy["key_4_language_menu"]
        elif digit == "5":
            action = "END_CALL"
            status = "COMPLETED"
            voice_prompt = copy["key_5_end"]
        elif digit in ["lang_te"]:
            action = "SWITCH_TO_TELUGU"
            lang = "telugu"
            new_copy = self.IVR_COPY["telugu"]
            voice_prompt = f"{new_copy['language_switched']} {new_copy['initial_call']}"
        elif digit in ["lang_hi"]:
            action = "SWITCH_TO_HINDI"
            lang = "hindi"
            new_copy = self.IVR_COPY["hindi"]
            voice_prompt = f"{new_copy['language_switched']} {new_copy['initial_call']}"
        elif digit in ["lang_en"]:
            action = "SWITCH_TO_ENGLISH"
            lang = "english"
            new_copy = self.IVR_COPY["english"]
            voice_prompt = f"{new_copy['language_switched']} {new_copy['initial_call']}"
        else:
            action = "INVALID_KEY"
            if lang == "telugu":
                voice_prompt = f"దయచేసి సరైన బటన్ నొక్కండి. {copy['menu_prompt']}"
            elif lang == "hindi":
                voice_prompt = f"कृपया सही बटन दबाएं। {copy['menu_prompt']}"
            else:
                voice_prompt = f"Invalid selection. Please choose an option from the menu. {copy['menu_prompt']}"

        return {
            "call_sid": call_sid,
            "status": status,
            "digit_received": digit,
            "action_taken": action,
            "voice_prompt": voice_prompt,
            "audio_transcript_en": (
                self.IVR_COPY["english"].get("key_1_alert" if action == "REPEAT_ALERT" else
                "key_2_safety" if action == "PLAY_SAFETY_INSTRUCTIONS" else
                "key_4_language_menu" if action == "LANGUAGE_SELECTION_MENU" else
                "key_5_end" if action == "END_CALL" else "initial_call", voice_prompt)
            ),
            "audio_transcript_te": (
                self.IVR_COPY["telugu"].get("key_1_alert" if action == "REPEAT_ALERT" else
                "key_2_safety" if action == "PLAY_SAFETY_INSTRUCTIONS" else
                "key_4_language_menu" if action == "LANGUAGE_SELECTION_MENU" else
                "key_5_end" if action == "END_CALL" else "initial_call", voice_prompt)
            ),
            "audio_transcript_hi": (
                self.IVR_COPY["hindi"].get("key_1_alert" if action == "REPEAT_ALERT" else
                "key_2_safety" if action == "PLAY_SAFETY_INSTRUCTIONS" else
                "key_4_language_menu" if action == "LANGUAGE_SELECTION_MENU" else
                "key_5_end" if action == "END_CALL" else "initial_call", voice_prompt)
            ),
            "language": lang,
            "next_options": [
                {"digit": "1", "label": "Repeat Alert"},
                {"digit": "2", "label": "Safety Instructions"},
                {"digit": "3", "label": "Nearest Shelter Info"},
                {"digit": "4", "label": "Change Language"},
                {"digit": "5", "label": "End Call"}
            ] if status != "COMPLETED" else [],
            "is_demo": True,
            "provider_type": "MockTelephonyProvider (Simulated Emergency Voice Alert for Demo)"
        }

    def end_call(self, call_sid: str) -> Dict[str, Any]:
        return {
            "call_sid": call_sid,
            "status": "COMPLETED",
            "message": "Call terminated successfully."
        }


class TwilioTelephonyProvider(TelephonyProvider):
    """
    Twilio Telephony Provider for Live Carrier Calls.
    Activates when TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, and TWILIO_PHONE_NUMBER are configured.
    """
    def __init__(self, account_sid: str, auth_token: str, from_phone: str):
        self.account_sid = account_sid
        self.auth_token = auth_token
        self.from_phone = from_phone
        self.mock_fallback = MockTelephonyProvider()
        try:
            from twilio.rest import Client
            self.client = Client(account_sid, auth_token)
        except Exception:
            self.client = None

    def make_call(self, to_phone: str, recipient_name: str, language: str, context: Dict[str, Any]) -> Dict[str, Any]:
        res = self.mock_fallback.make_call(to_phone, recipient_name, language, context)
        if self.client:
            try:
                tw_call = self.client.calls.create(
                    to=to_phone,
                    from_=self.from_phone,
                    twiml=f"<Response><Say voice='Polly.Aditi'>{res['voice_prompt']}</Say></Response>"
                )
                res["call_sid"] = tw_call.sid
                res["is_demo"] = False
                res["provider_type"] = "Twilio Live Telephony"
            except Exception as e:
                res["twilio_note"] = f"Twilio fallback to local simulator: {str(e)}"
        return res

    def play_message(self, call_sid: str, message: str, language: str) -> Dict[str, Any]:
        return self.mock_fallback.play_message(call_sid, message, language)

    def collect_digits(self, call_sid: str, digit: str, current_language: str, context: Dict[str, Any] = None) -> Dict[str, Any]:
        return self.mock_fallback.collect_digits(call_sid, digit, current_language, context)

    def end_call(self, call_sid: str) -> Dict[str, Any]:
        if self.client:
            try:
                self.client.calls(call_sid).update(status="completed")
            except Exception:
                pass
        return self.mock_fallback.end_call(call_sid)


def get_ivr_provider() -> TelephonyProvider:
    if settings.TWILIO_ACCOUNT_SID and settings.TWILIO_AUTH_TOKEN and settings.TWILIO_PHONE_NUMBER:
        return TwilioTelephonyProvider(
            settings.TWILIO_ACCOUNT_SID,
            settings.TWILIO_AUTH_TOKEN,
            settings.TWILIO_PHONE_NUMBER
        )
    return MockTelephonyProvider()

# Active IVR Provider instance
ivr_provider = get_ivr_provider()
