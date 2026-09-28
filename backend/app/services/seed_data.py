import os
from datetime import datetime, timedelta
from sqlalchemy.orm import Session
from app.models.user import User, UserRole, LanguagePreference
from app.models.cyclone import Cyclone, Observation, SatelliteImage, CycloneFingerprint
from app.models.prediction import HistoricalCyclone, Prediction, ModelVersion
from app.models.alert import Alert, AlertRecipient, IVRCall, SafetyInstruction, Shelter
from app.models.audit import AuditLog
from app.utils.security import get_password_hash
from app.utils.image_generator import generate_satellite_cyclone_image
from app.services.ml_engine import CycloneMLEngine

def seed_database(db: Session):
    """Populates database with realistic Bay of Bengal & Arabian Sea cyclone datasets."""
    
    # Check if already seeded
    if db.query(Cyclone).first() is not None:
        return

    print("Seeding CycloneFusion AI database with realistic DEMO DATA...")

    # 1. Users
    users = [
        User(
            name="NDRF Director Sharma",
            phone_number="9876543210",
            email="admin@cyclonefusion.gov.in",
            password_hash=get_password_hash("adminpassword123"),
            role=UserRole.ADMIN,
            preferred_language=LanguagePreference.ENGLISH,
            district="Visakhapatnam",
            state="Andhra Pradesh",
            area="Command Control Center",
            alert_preference="ALL"
        ),
        User(
            name="Dr. Radhakrishnan (IMD Analyst)",
            phone_number="9876543211",
            email="analyst@cyclonefusion.gov.in",
            password_hash=get_password_hash("analystpassword123"),
            role=UserRole.ANALYST,
            preferred_language=LanguagePreference.ENGLISH,
            district="Visakhapatnam",
            state="Andhra Pradesh",
            area="Meteorological Forecast Wing",
            alert_preference="ALL"
        ),
        User(
            name="Praveen Kumar (Coastal Fisherfolk)",
            phone_number="9876543212",
            email="praveen.citizen@gmail.com",
            password_hash=get_password_hash("citizen123"),
            role=UserRole.CITIZEN,
            preferred_language=LanguagePreference.TELUGU,
            district="Visakhapatnam",
            state="Andhra Pradesh",
            area="Bheemunipatnam Coastal Ward",
            alert_preference="IVR"
        ),
        User(
            name="Ramesh Chandra Patra",
            phone_number="9876543213",
            email="ramesh.patra@gmail.com",
            password_hash=get_password_hash("citizen123"),
            role=UserRole.CITIZEN,
            preferred_language=LanguagePreference.HINDI,
            district="Srikakulam",
            state="Andhra Pradesh",
            area="Kalingapatnam Port Area",
            alert_preference="ALL"
        ),
        User(
            name="Ananya Rao",
            phone_number="9876543214",
            email="ananya.rao@gmail.com",
            password_hash=get_password_hash("citizen123"),
            role=UserRole.CITIZEN,
            preferred_language=LanguagePreference.ENGLISH,
            district="Kakinada",
            state="Andhra Pradesh",
            area="Uppada Coastal Beach Road",
            alert_preference="SMS"
        )
    ]
    db.add_all(users)
    db.commit()

    # 2. Historical Cyclone Dataset (Ground Truth for Similarity Search)
    historical_cyclones = [
        HistoricalCyclone(
            name="Super Cyclone AMPHAN",
            code="BOB-01-2020",
            year=2020,
            basin="Bay of Bengal",
            max_wind_speed=260.0,
            min_pressure=906.0,
            category="Super Cyclonic Storm (SuCS)",
            landfall_location="Digha (West Bengal) & Hatiya Islands (Bangladesh)",
            landfall_date="20 May 2020",
            context_description="One of the strongest tropical cyclones ever recorded in the Bay of Bengal. Exhibited explosive intensification fueled by record SSTs of 31°C. Caused massive storm surge and widespread inundation across Sundarbans.",
            casualties_impact="Total economic loss ~$13.5 Billion USD; 128 casualties across India and Bangladesh.",
            fingerprint_vector=[0.65, 0.72, 0.98, 0.95, 0.92, 0.55, 0.94, 0.96]
        ),
        HistoricalCyclone(
            name="Extremely Severe Cyclone FANI",
            code="BOB-02-2019",
            year=2019,
            basin="Bay of Bengal",
            max_wind_speed=215.0,
            min_pressure=932.0,
            category="Extremely Severe Cyclonic Storm (ESCS)",
            landfall_location="Puri, Odisha",
            landfall_date="03 May 2019",
            context_description="Catastrophic pre-monsoon cyclone that made landfall directly over Puri with sustained winds of 185–205 km/h. Demonstrated exceptional structural symmetry and pinhole eye structure.",
            casualties_impact="89 fatalities; exemplary preemptive evacuation of 1.2 million citizens by OSDMA minimized loss of life.",
            fingerprint_vector=[0.60, 0.68, 0.88, 0.85, 0.88, 0.45, 0.89, 0.92]
        ),
        HistoricalCyclone(
            name="Very Severe Cyclone HUDHUD",
            code="BOB-03-2014",
            year=2014,
            basin="Bay of Bengal",
            max_wind_speed=185.0,
            min_pressure=950.0,
            category="Very Severe Cyclonic Storm (VSCS)",
            landfall_location="Visakhapatnam, Andhra Pradesh",
            landfall_date="12 Oct 2014",
            context_description="Direct landfall over the major metropolitan port city of Visakhapatnam. Damaged the Doppler Weather Radar tower and caused severe infrastructure destruction in North Andhra.",
            casualties_impact="68 casualties; infrastructure damages exceeding $3.5 Billion in Visakhapatnam, Vizianagaram, Srikakulam.",
            fingerprint_vector=[0.52, 0.62, 0.78, 0.75, 0.82, 0.40, 0.84, 0.85]
        ),
        HistoricalCyclone(
            name="Very Severe Cyclone VARDAH",
            code="BOB-06-2016",
            year=2016,
            basin="Bay of Bengal",
            max_wind_speed=130.0,
            min_pressure=975.0,
            category="Very Severe Cyclonic Storm (VSCS)",
            landfall_location="Chennai & Tiruvallur, Tamil Nadu",
            landfall_date="12 Dec 2016",
            context_description="Traversed central Bay of Bengal, made landfall close to Chennai city port. Caused massive tree falls and severe telecommunication blackout.",
            casualties_impact="18 casualties; substantial telecom and grid disruptions.",
            fingerprint_vector=[0.42, 0.55, 0.60, 0.62, 0.70, 0.38, 0.75, 0.78]
        ),
        HistoricalCyclone(
            name="Severe Cyclone MICHAUNG",
            code="BOB-05-2023",
            year=2023,
            basin="Bay of Bengal",
            max_wind_speed=110.0,
            min_pressure=986.0,
            category="Severe Cyclonic Storm (SCS)",
            landfall_location="Bapatla, Andhra Pradesh",
            landfall_date="05 Dec 2023",
            context_description="Slow-moving system that triggered unprecedented torrential downpours across Chennai metropolitan basin before making landfall near Bapatla.",
            casualties_impact="17 fatalities; major urban flooding and standing crop damage.",
            fingerprint_vector=[0.46, 0.58, 0.52, 0.54, 0.68, 0.28, 0.72, 0.74]
        ),
        HistoricalCyclone(
            name="Extremely Severe Cyclone PHAILIN",
            code="BOB-04-2013",
            year=2013,
            basin="Bay of Bengal",
            max_wind_speed=215.0,
            min_pressure=940.0,
            category="Extremely Severe Cyclonic Storm (ESCS)",
            landfall_location="Gopalpur, Ganjam, Odisha",
            landfall_date="12 Oct 2013",
            context_description="Immense cloud canopy covering the entire Bay of Bengal. Prompted India's largest evacuation operation involving nearly 1 million people.",
            casualties_impact="45 casualties; landmark disaster management success story.",
            fingerprint_vector=[0.58, 0.66, 0.86, 0.82, 0.85, 0.42, 0.88, 0.90]
        )
    ]
    db.add_all(historical_cyclones)
    db.commit()

    # 3. Active Cyclones & Sequential Tracking Data
    now = datetime.utcnow()

    # PRIMARY DEMO CYCLONE: Cyclone VAYU-26
    vayu = Cyclone(
        name="Cyclone VAYU-26",
        code="BOB-01-2026",
        basin="Bay of Bengal",
        status="Intensifying",
        classification="Very Severe Cyclonic Storm (VSCS)",
        category=3,
        max_wind_speed=145.0,
        min_pressure=968.0,
        current_latitude=15.8,
        current_longitude=84.2,
        movement_direction="NNW",
        movement_speed=16.0,
        is_demo=True,
        start_date=now - timedelta(days=2)
    )
    db.add(vayu)
    db.commit()
    db.refresh(vayu)

    # Secondary Active Cyclones
    deep_dep = Cyclone(
        name="Deep Depression 02B",
        code="BOB-02-2026",
        basin="Bay of Bengal",
        status="Under Observation",
        classification="Deep Depression (DD)",
        category=0,
        max_wind_speed=58.0,
        min_pressure=1002.0,
        current_latitude=11.2,
        current_longitude=89.5,
        movement_direction="NW",
        movement_speed=12.0,
        is_demo=True,
        start_date=now - timedelta(hours=18)
    )
    asna = Cyclone(
        name="Cyclone ASNA-26",
        code="ARB-01-2026",
        basin="Arabian Sea",
        status="Active",
        classification="Cyclonic Storm (CS)",
        category=1,
        max_wind_speed=75.0,
        min_pressure=994.0,
        current_latitude=19.4,
        current_longitude=66.8,
        movement_direction="WNW",
        movement_speed=14.0,
        is_demo=True,
        start_date=now - timedelta(days=1)
    )
    db.add_all([deep_dep, asna])
    db.commit()

    # Observations sequence for Cyclone VAYU-26 (Simulates continuous satellite telemetry over 36 hours)
    vayu_obs_data = [
        {"hours_ago": 36, "lat": 12.1, "lon": 87.8, "wind": 65.0, "press": 998.0, "sst": 30.1, "dir": "NNW", "speed": 14.0, "cloud": 0.65, "spiral": 0.68, "trend": "Intensifying"},
        {"hours_ago": 30, "lat": 12.9, "lon": 87.1, "wind": 80.0, "press": 992.0, "sst": 30.2, "dir": "NNW", "speed": 14.5, "cloud": 0.70, "spiral": 0.72, "trend": "Intensifying"},
        {"hours_ago": 24, "lat": 13.7, "lon": 86.4, "wind": 98.0, "press": 985.0, "sst": 30.4, "dir": "NNW", "speed": 15.0, "cloud": 0.76, "spiral": 0.78, "trend": "Intensifying"},
        {"hours_ago": 18, "lat": 14.4, "lon": 85.6, "wind": 115.0, "press": 979.0, "sst": 30.5, "dir": "NNW", "speed": 15.5, "cloud": 0.82, "spiral": 0.84, "trend": "Intensifying"},
        {"hours_ago": 12, "lat": 15.1, "lon": 84.9, "wind": 130.0, "press": 973.0, "sst": 30.6, "dir": "NNW", "speed": 16.0, "cloud": 0.86, "spiral": 0.88, "trend": "Intensifying"},
        {"hours_ago": 6, "lat": 15.5, "lon": 84.5, "wind": 140.0, "press": 970.0, "sst": 30.5, "dir": "NNW", "speed": 16.0, "cloud": 0.89, "spiral": 0.90, "trend": "Intensifying"},
        {"hours_ago": 0, "lat": 15.8, "lon": 84.2, "wind": 145.0, "press": 968.0, "sst": 30.5, "dir": "NNW", "speed": 16.0, "cloud": 0.91, "spiral": 0.92, "trend": "Intensifying"},
    ]

    obs_objects = []
    for item in vayu_obs_data:
        obs = Observation(
            cyclone_id=vayu.id,
            timestamp=now - timedelta(hours=item["hours_ago"]),
            latitude=item["lat"],
            longitude=item["lon"],
            wind_speed=item["wind"],
            pressure=item["press"],
            sst=item["sst"],
            movement_direction=item["dir"],
            movement_speed=item["speed"],
            cloud_organization=item["cloud"],
            spiral_structure=item["spiral"],
            intensity_trend=item["trend"],
            data_source="INSAT-3DR TIR-1 + NOAA AVHRR Fused Telemetry (DEMO)"
        )
        obs_objects.append(obs)
    db.add_all(obs_objects)
    db.commit()

    # Generate synthetic Satellite Imagery for Cyclone VAYU-26
    img_filename = "insat3dr_vayu_2026_latest.jpg"
    img_url = generate_satellite_cyclone_image(
        cyclone_name="VAYU-26",
        wind_speed=145.0,
        category="VSCS",
        output_filename=img_filename,
        is_demo=True
    )
    
    sat_img = SatelliteImage(
        cyclone_id=vayu.id,
        observation_id=obs_objects[-1].id,
        filename=img_filename,
        image_url=img_url,
        satellite_type="INSAT-3DR / Multi-spectral Doppler",
        channel="Thermal Infrared (TIR1 - 10.8µm)",
        resolution="2.0 km Enhanced",
        spiral_intensity=0.92,
        eye_detected=True,
        is_demo=True
    )
    db.add(sat_img)
    db.commit()

    # Generate Fingerprint for Cyclone VAYU-26
    latest_obs = obs_objects[-1]
    fp_data = CycloneMLEngine.generate_fingerprint_vector(latest_obs)
    fingerprint = CycloneFingerprint(
        cyclone_id=vayu.id,
        observation_id=latest_obs.id,
        latitude=fp_data["latitude"],
        longitude=fp_data["longitude"],
        wind_speed=fp_data["wind_speed"],
        pressure=fp_data["pressure"],
        sst=fp_data["sst"],
        movement_direction=fp_data["movement_direction"],
        movement_speed=fp_data["movement_speed"],
        cloud_organization=fp_data["cloud_organization"],
        spiral_structure=fp_data["spiral_structure"],
        intensity_trend=fp_data["intensity_trend"],
        vector_json=fp_data["vector_json"]
    )
    db.add(fingerprint)
    db.commit()

    # Generate ML Prediction & XAI for Cyclone VAYU-26
    trend_res = CycloneMLEngine.predict_trend(obs_objects)
    cls_name, cat, cls_conf = CycloneMLEngine.classify_cyclone(vayu.max_wind_speed, vayu.min_pressure)
    xai_res = CycloneMLEngine.generate_xai_explanation(vayu, latest_obs, trend_res, cls_name)

    pred = Prediction(
        cyclone_id=vayu.id,
        model_version="v2.1-CycloneFusion-MultiSource-DEMO",
        cyclone_detected=True,
        probability=0.965,
        classification=cls_name,
        classification_confidence=cls_conf,
        trend=trend_res["trend"],
        trend_confidence=trend_res["trend_confidence"],
        intensity_forecast_12h=trend_res["intensity_forecast_12h"],
        intensity_forecast_24h=trend_res["intensity_forecast_24h"],
        intensity_forecast_48h=trend_res["intensity_forecast_48h"],
        predicted_landfall_eta="Tomorrow 14:00 IST (24 Hours)",
        predicted_landfall_location="Between Visakhapatnam and Kalingapatnam (North Andhra Coast)",
        explanation_summary=xai_res["explanation_summary"],
        feature_attributions=xai_res["feature_attributions"],
        key_factors=xai_res["key_factors"],
        confidence_breakdown=xai_res["confidence_breakdown"],
        is_demo=True
    )
    db.add(pred)
    db.commit()

    # 4. Emergency Shelters Directory
    shelters = [
        Shelter(
            name="Visakhapatnam Port Trust Cyclone Shelter #1",
            district="Visakhapatnam",
            state="Andhra Pradesh",
            address="Near Coastal Beach Road, Bheemili, Visakhapatnam",
            capacity=800,
            current_occupancy=140,
            contact_phone="0891-2564890",
            latitude=17.892,
            longitude=83.456,
            amenities=["Solar Backup", "First Aid Center", "Ration Kitchen", "Clean Water Tanker", "Satellite Phone"],
            status="READY"
        ),
        Shelter(
            name="Kakinada Government Polytechnic Multipurpose Shelter",
            district="Kakinada",
            state="Andhra Pradesh",
            address="Vakalapudi, Kakinada Rural",
            capacity=650,
            current_occupancy=60,
            contact_phone="0884-2371234",
            latitude=16.989,
            longitude=82.247,
            amenities=["Backup Generator", "Medical Staff", "Dry Food Ration", "Separate Women Ward"],
            status="READY"
        ),
        Shelter(
            name="Srikakulam Coastal Disaster Rehabilitation Complex",
            district="Srikakulam",
            state="Andhra Pradesh",
            address="Kalingapatnam Coastal Highway",
            capacity=1200,
            current_occupancy=210,
            contact_phone="08942-223456",
            latitude=18.334,
            longitude=84.129,
            amenities=["NDRF Emergency Post", "Helipad", "Water Purification", "Emergency Pharmacy"],
            status="READY"
        ),
        Shelter(
            name="Puri Multipurpose Cyclone Shelter - Sector 4",
            district="Puri",
            state="Odisha",
            address="Marine Drive Road, Konark-Puri Coastal Sector",
            capacity=1000,
            current_occupancy=0,
            contact_phone="06752-222100",
            latitude=19.813,
            longitude=85.831,
            amenities=["Solar Power", "OSDMA Emergency Team", "Drinking Water Supply", "Siren Relay"],
            status="READY"
        )
    ]
    db.add_all(shelters)
    db.commit()

    # 5. Safety Instructions (Multilingual)
    safety_instructions = [
        SafetyInstruction(
            stage="BEFORE",
            category="Coastal Residents",
            instruction_en="Secure loose roof tiles, doors, and window shutters. Trim dry tree branches near power lines.",
            instruction_te="ఇంటి పైకప్పు, తలుపులు, కిటికీలను గట్టిగా భద్రపరచండి. విద్యుత్ తీగల దగ్గర ఉన్న చెట్ల కొమ్మలను తొలగించండి.",
            instruction_hi="घर की छत, दरवाजों और खिड़कियों को सुरक्षित करें। बिजली के तारों के पास सूखी शाखाओं को काटें।",
            priority=1,
            icon="home"
        ),
        SafetyInstruction(
            stage="BEFORE",
            category="Fishermen",
            instruction_en="Strict ban on venturing into Bay of Bengal. Return all mechanized trawlers and country boats to safety harbors immediately.",
            instruction_te="బంగాళాఖాతంలోకి వేటకు వెళ్లరాదు. అన్ని పడవలను వెంటనే సురక్షిత తీర ప్రాంతాలకు చేర్చండి.",
            instruction_hi="बंगाल की खाड़ी में समुद्र में जाने पर पूर्ण प्रतिबंध। सभी नावों को तुरंत सुरक्षित बंदरगाहों पर लाएं।",
            priority=1,
            icon="anchor"
        ),
        SafetyInstruction(
            stage="DURING",
            category="General Public",
            instruction_en="Stay indoors within concrete reinforced structures. Disconnect electrical mains and LPG gas regulators.",
            instruction_te="పక్కా భవనాలలో సురక్షితంగా ఉండండి. ప్రధాన విద్యుత్ స్విచ్ మరియు గ్యాస్ సిలిండర్లను ఆపివేయండి.",
            instruction_hi="मजबूत पक्के मकानों के अंदर रहें। बिजली का मेन स्विच और एलपीजी गैस बंद रखें।",
            priority=2,
            icon="shield-alert"
        ),
        SafetyInstruction(
            stage="AFTER",
            category="General Public",
            instruction_en="Do not touch dangling power lines. Drink only boiled water. Beware of snakes and structural collapses.",
            instruction_te="తెగిపడిన విద్యుత్ తీగలను తాకవద్దు. కాచి చల్లార్చిన నీటినే తాగండి. శిథిలాల వద్ద జాగ్రత్తగా ఉండండి.",
            instruction_hi="टूटे हुए बिजली के तारों को न छुएं। केवल उबला हुआ पानी पिएं। सांपों और कमजोर ढांचों से सावधान रहें।",
            priority=3,
            icon="heart-handshake"
        )
    ]
    db.add_all(safety_instructions)
    db.commit()

    # 6. Model Versions
    model_versions = [
        ModelVersion(
            name="CycloneFusion-PatternIdentifier",
            model_type="Pattern Identifier",
            version="v2.1",
            accuracy=0.942,
            f1_score=0.938,
            precision=0.945,
            recall=0.931,
            training_dataset_size=18200,
            parameters_count="28.4M",
            is_active=True
        ),
        ModelVersion(
            name="CycloneFusion-CategoryClassifier",
            model_type="Category Classifier",
            version="v2.1",
            accuracy=0.928,
            f1_score=0.921,
            precision=0.930,
            recall=0.912,
            training_dataset_size=18200,
            parameters_count="34.1M",
            is_active=True
        ),
        ModelVersion(
            name="CycloneFusion-TrendPredictor",
            model_type="Trend Predictor",
            version="v1.8",
            accuracy=0.896,
            f1_score=0.889,
            precision=0.902,
            recall=0.876,
            training_dataset_size=12400,
            parameters_count="18.6M",
            is_active=True
        )
    ]
    db.add_all(model_versions)
    db.commit()

    # 7. Initial Active Alert for Cyclone Vayu
    alert = Alert(
        cyclone_id=vayu.id,
        title="RED EMERGENCY ALERT: Severe Cyclone VAYU-26 Advancing Towards North Andhra / Odisha",
        severity="EMERGENCY",
        hazard_type="Gale Winds (145+ km/h), Extreme Inundation & Storm Surge (2.5m)",
        affected_districts=["Visakhapatnam", "Kakinada", "Srikakulam", "Vizianagaram", "Ganjam", "Puri"],
        affected_states=["Andhra Pradesh", "Odisha"],
        message_en="Emergency Cyclone Warning: Cyclone VAYU-26 is intensifying rapidly over Westcentral Bay of Bengal. Gale winds up to 150 km/h and heavy rainfall expected. Evacuate low-lying areas immediately. Call 1070 for assistance.",
        message_te="అత్యవసర తుఫాను హెచ్చరిక: 'వాయు-26' తుఫాను తీవ్ర రూపం దాల్చింది. గంటకు 150 కి.మీ వేగంతో పెనుగాలులు మరియు భారీ వర్షాలు కురిసే అవకాశం ఉంది. లోతట్టు ప్రాంతాల ప్రజలు వెంటనే పునరావాస కేంద్రాలకు వెళ్లండి. సహాయం కోసం 1070 కి కాల్ చేయండి.",
        message_hi="आपातकालीन चक्रवात चेतावनी: चक्रवात 'वायु-26' तेजी से शक्तिशाली हो रहा है। 150 किमी/घंटा की रफ्तार से हवाएं और भारी बारिश की संभावना। निचले इलाकों से तुरंत सुरक्षित स्थानों पर जाएं। सहायता हेतु 1070 डायल करें।",
        channels=["SMS", "IVR", "WHATSAPP", "SIREN"],
        is_broadcast=True,
        total_recipients=18450,
        delivered_count=17920,
        is_demo=True
    )
    db.add(alert)
    db.commit()
    db.refresh(alert)

    # Initial Audit Log
    db.add(AuditLog(
        username="system_seeder",
        action="SYSTEM_INITIALIZED",
        target_type="System",
        target_id="0",
        details={"status": "Seeded DEMO DATA for Bay of Bengal & Arabian Sea basins."}
    ))
    db.commit()

    print("Database seeding completed successfully.")
