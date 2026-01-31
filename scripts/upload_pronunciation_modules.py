"""
Script to upload pronunciation modules to MongoDB.

Usage:
    python scripts/upload_pronunciation_modules.py

This will upload pronunciation modules with exercises to the 'pronunciation_modules' collection.
"""

import asyncio
import os
import sys

# Add parent directory to path for imports
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv

load_dotenv()

# Pronunciation modules data
PRONUNCIATION_MODULES = [
    {
        "sound_id": "sound_st_initial",
        "phoneme_ipa": "ʃt",
        "name": "Initial St",
        "description": "In German, when 's' appears before 't' at the beginning of a syllable, it is pronounced like 'sh' in 'shoe'.",
        "articulatory_tip": "Round your lips slightly and place your tongue near the roof of your mouth, just like the English 'sh'. Then immediately stop the air with a sharp 't'.",
        "difficulty_level": "intermediate",
        "exercises": [
            {"word": "Student", "ipa": "ʃtuˈdɛnt", "sentence": "Der Student lernt in der Bibliothek."},
            {"word": "Stunde", "ipa": "ˈʃtʊndə", "sentence": "Die Prüfung dauert eine Stunde."},
            {"word": "Straße", "ipa": "ˈʃtʁaːsə", "sentence": "Das Auto steht auf der Straße."},
            {"word": "Stadt", "ipa": "ʃtat", "sentence": "Wir fahren heute in die Stadt."},
            {"word": "stehen", "ipa": "ˈʃteːən", "sentence": "Bitte bleiben Sie stehen."},
            {"word": "Stuhl", "ipa": "ʃtuːl", "sentence": "Der Stuhl ist aus Holz."},
            {"word": "stark", "ipa": "ʃtaʁk", "sentence": "Der Kaffee ist sehr stark."},
            {"word": "Stern", "ipa": "ʃtɛʁn", "sentence": "Der Stern leuchtet hell."},
            {"word": "Stück", "ipa": "ʃtʏk", "sentence": "Möchtest du ein Stück Kuchen?"},
            {"word": "Stelle", "ipa": "ˈʃtɛlə", "sentence": "Ich habe eine neue Stelle gefunden."},
            {"word": "still", "ipa": "ʃtɪl", "sentence": "In der Bibliothek muss man still sein."},
            {"word": "Stein", "ipa": "ʃtaɪ̯n", "sentence": "Der Stein ist schwer."},
            {"word": "Stolz", "ipa": "ʃtɔlt͡s", "sentence": "Sie ist sehr stolz auf ihre Arbeit."},
            {"word": "Sturm", "ipa": "ʃtʊʁm", "sentence": "Der Sturm war sehr laut."},
            {"word": "Start", "ipa": "ʃtaʁt", "sentence": "Der Start war schwierig."},
            {"word": "Stock", "ipa": "ʃtɔk", "sentence": "Wir wohnen im dritten Stock."},
            {"word": "Stufe", "ipa": "ˈʃtuːfə", "sentence": "Pass auf die Stufe auf!"},
            {"word": "Stoff", "ipa": "ʃtɔf", "sentence": "Der Stoff fühlt sich weich an."},
            {"word": "Stift", "ipa": "ʃtɪft", "sentence": "Hast du einen Stift für mich?"},
            {"word": "Staat", "ipa": "ʃtaːt", "sentence": "Der Staat unterstützt die Schulen."},
            {"word": "stehlen", "ipa": "ˈʃteːlən", "sentence": "Man darf nicht stehlen."},
            {"word": "Stimme", "ipa": "ˈʃtɪmə", "sentence": "Sie hat eine schöne Stimme."}
        ]
    },
    {
        "sound_id": "sound_sp_initial",
        "phoneme_ipa": "ʃp",
        "name": "Initial Sp",
        "description": "Similar to 'St', when 's' appears before 'p' at the start of a syllable, it sounds like 'sh' + 'p'.",
        "articulatory_tip": "Form the 'sh' sound with rounded lips, then close your lips tightly to pop the 'p' sound.",
        "difficulty_level": "intermediate",
        "exercises": [
            {"word": "Sprache", "ipa": "ˈʃpʁaːxə", "sentence": "Die deutsche Sprache ist interessant."},
            {"word": "Sport", "ipa": "ʃpɔʁt", "sentence": "Ich mache jeden Tag Sport."},
            {"word": "spät", "ipa": "ʃpɛːt", "sentence": "Es ist schon sehr spät."},
            {"word": "Spaß", "ipa": "ʃpaːs", "sentence": "Das Spiel macht viel Spaß."},
            {"word": "Spiel", "ipa": "ʃpiːl", "sentence": "Das Spiel beginnt um acht Uhr."},
            {"word": "Spiegel", "ipa": "ˈʃpiːɡl̩", "sentence": "Sie schaut in den Spiegel."},
            {"word": "springen", "ipa": "ˈʃpʁɪŋən", "sentence": "Die Kinder springen ins Wasser."},
            {"word": "Spitze", "ipa": "ˈʃpɪt͡sə", "sentence": "Der Bleistift hat keine Spitze mehr."},
            {"word": "Spur", "ipa": "ʃpuːɐ̯", "sentence": "Der Hund folgt der Spur."},
            {"word": "sparen", "ipa": "ˈʃpaːʁən", "sentence": "Wir müssen für den Urlaub sparen."},
            {"word": "Speise", "ipa": "ˈʃpaɪ̯zə", "sentence": "Die Speise war köstlich."},
            {"word": "Spinne", "ipa": "ˈʃpɪnə", "sentence": "Ich habe Angst vor der Spinne."},
            {"word": "Speck", "ipa": "ʃpɛk", "sentence": "Zum Frühstück essen wir Eier mit Speck."},
            {"word": "Spion", "ipa": "ʃpiˈoːn", "sentence": "Der Spion hatte ein Geheimnis."},
            {"word": "Spende", "ipa": "ˈʃpɛndə", "sentence": "Danke für deine großzügige Spende."},
            {"word": "Spaziergang", "ipa": "ʃpaˈt͡siːɐ̯ɡaŋ", "sentence": "Wir machen einen Spaziergang im Park."},
            {"word": "speichern", "ipa": "ˈʃpaɪ̯çɐn", "sentence": "Vergiss nicht, die Datei zu speichern."},
            {"word": "Spezial", "ipa": "ʃpeˈt͡si̯aːl", "sentence": "Das ist ein Spezial-Angebot."},
            {"word": "spontan", "ipa": "ʃpɔnˈtaːn", "sentence": "Der Ausflug war sehr spontan."},
            {"word": "Spannung", "ipa": "ˈʃpanʊŋ", "sentence": "Die Spannung im Film steigt."},
            {"word": "sprechen", "ipa": "ˈʃpʁɛçən", "sentence": "Können wir kurz sprechen?"},
            {"word": "Spital", "ipa": "ʃpiˈtaːl", "sentence": "Er liegt im Spital."}
        ]
    },
    {
        "sound_id": "sound_ch_ich",
        "phoneme_ipa": "ç",
        "name": "Ich-Laut",
        "description": "The soft 'ch' sound found after front vowels (i, e, ä, ö, ü) and consonants l, n, r.",
        "articulatory_tip": "This is NOT a 'k' or a 'sh'. Spread your lips in a smile. Raise the middle of your tongue to the roof of your mouth (hard palate) and let air hiss through the gap.",
        "difficulty_level": "advanced",
        "exercises": [
            {"word": "ich", "ipa": "ɪç", "sentence": "Ich heiße Anna."},
            {"word": "mich", "ipa": "mɪç", "sentence": "Hörst du mich?"},
            {"word": "dich", "ipa": "dɪç", "sentence": "Ich freue mich für dich."},
            {"word": "sich", "ipa": "zɪç", "sentence": "Er muss sich beeilen."},
            {"word": "nicht", "ipa": "nɪçt", "sentence": "Das ist nicht richtig."},
            {"word": "leicht", "ipa": "laɪ̯çt", "sentence": "Die Aufgabe war sehr leicht."},
            {"word": "echt", "ipa": "ɛçt", "sentence": "Ist das Bild echt?"},
            {"word": "recht", "ipa": "ʁɛçt", "sentence": "Du hast recht."},
            {"word": "schlecht", "ipa": "ʃlɛçt", "sentence": "Mir ist ein bisschen schlecht."},
            {"word": "Licht", "ipa": "lɪçt", "sentence": "Mach bitte das Licht an."},
            {"word": "Gesicht", "ipa": "ɡəˈzɪçt", "sentence": "Er hat ein freundliches Gesicht."},
            {"word": "Geschichte", "ipa": "ɡəˈʃɪçtə", "sentence": "Opa erzählt eine Geschichte."},
            {"word": "Küche", "ipa": "ˈkʏçə", "sentence": "Das Essen steht in der Küche."},
            {"word": "Bücher", "ipa": "ˈbyːçɐ", "sentence": "Ich lese gerne Bücher."},
            {"word": "sicher", "ipa": "ˈzɪçɐ", "sentence": "Bist du dir sicher?"},
            {"word": "wichtig", "ipa": "ˈvɪçtɪç", "sentence": "Dieser Termin ist sehr wichtig."},
            {"word": "richtig", "ipa": "ˈʁɪçtɪç", "sentence": "Das hast du richtig gemacht."},
            {"word": "vielleicht", "ipa": "fiˈlaɪ̯çt", "sentence": "Vielleicht regnet es morgen."},
            {"word": "Gespräch", "ipa": "ɡəˈʃpʁɛːç", "sentence": "Das war ein gutes Gespräch."},
            {"word": "Milch", "ipa": "mɪlç", "sentence": "Ich trinke Kaffee mit Milch."},
            {"word": "manchmal", "ipa": "ˈmançmaːl", "sentence": "Manchmal gehe ich ins Kino."},
            {"word": "lächeln", "ipa": "ˈlɛçl̩n", "sentence": "Sie muss immer lächeln."}
        ]
    },
    {
        "sound_id": "sound_ch_ach",
        "phoneme_ipa": "x",
        "name": "Ach-Laut",
        "description": "The hard 'ch' sound found after back vowels (a, o, u, au).",
        "articulatory_tip": "Like the Scottish 'loch'. Raise the back of your tongue towards the soft palate (velum) and let air pass through with friction. It's rougher than the Ich-Laut.",
        "difficulty_level": "advanced",
        "exercises": [
            {"word": "ach", "ipa": "ax", "sentence": "Ach, das ist schade!"},
            {"word": "auch", "ipa": "aʊ̯x", "sentence": "Ich komme auch zur Party."},
            {"word": "Buch", "ipa": "buːx", "sentence": "Das Buch ist sehr interessant."},
            {"word": "Kuchen", "ipa": "ˈkuːxən", "sentence": "Der Kuchen schmeckt lecker."},
            {"word": "machen", "ipa": "ˈmaxən", "sentence": "Was möchtest du heute machen?"},
            {"word": "lachen", "ipa": "ˈlaxən", "sentence": "Die Kinder lachen laut."},
            {"word": "Sprache", "ipa": "ˈʃpʁaːxə", "sentence": "Die deutsche Sprache ist schön."},
            {"word": "brauchen", "ipa": "ˈbʁaʊ̯xən", "sentence": "Wir brauchen mehr Zeit."},
            {"word": "Woche", "ipa": "ˈvɔxə", "sentence": "Nächste Woche fahre ich weg."},
            {"word": "Koch", "ipa": "kɔx", "sentence": "Der Koch bereitet das Essen vor."},
            {"word": "kochen", "ipa": "ˈkɔxən", "sentence": "Kannst du gut kochen?"},
            {"word": "Tochter", "ipa": "ˈtɔxtɐ", "sentence": "Meine Tochter ist acht Jahre alt."},
            {"word": "Nacht", "ipa": "naxt", "sentence": "Gute Nacht!"},
            {"word": "Dach", "ipa": "dax", "sentence": "Das Dach ist rot."},
            {"word": "nach", "ipa": "naːx", "sentence": "Nach dem Essen gehen wir spazieren."},
            {"word": "noch", "ipa": "nɔx", "sentence": "Möchtest du noch etwas?"},
            {"word": "hoch", "ipa": "hoːx", "sentence": "Der Berg ist sehr hoch."},
            {"word": "suchen", "ipa": "ˈzuːxən", "sentence": "Ich suche meine Schlüssel."},
            {"word": "besuchen", "ipa": "bəˈzuːxən", "sentence": "Ich möchte meine Großeltern besuchen."},
            {"word": "versuchen", "ipa": "fɛɐ̯ˈzuːxən", "sentence": "Wir werden es versuchen."}
        ]
    },
    {
        "sound_id": "sound_umlaut_ue",
        "phoneme_ipa": "y",
        "name": "Umlaut ü",
        "description": "The German 'ü' is a close front rounded vowel - you say 'ee' with rounded lips.",
        "articulatory_tip": "Say 'ee' (as in 'see') but round your lips tightly like you're going to whistle. Keep your tongue high and forward in your mouth.",
        "difficulty_level": "advanced",
        "exercises": [
            {"word": "über", "ipa": "ˈyːbɐ", "sentence": "Wir sprechen über das Wetter."},
            {"word": "Tür", "ipa": "tyːɐ̯", "sentence": "Bitte schließ die Tür."},
            {"word": "grün", "ipa": "ɡʁyːn", "sentence": "Das Gras ist grün."},
            {"word": "müde", "ipa": "ˈmyːdə", "sentence": "Ich bin sehr müde."},
            {"word": "fünf", "ipa": "fʏnf", "sentence": "Ich habe fünf Äpfel."},
            {"word": "Glück", "ipa": "ɡlʏk", "sentence": "Viel Glück bei der Prüfung!"},
            {"word": "Frühling", "ipa": "ˈfʁyːlɪŋ", "sentence": "Der Frühling ist meine Lieblingsjahreszeit."},
            {"word": "Hügel", "ipa": "ˈhyːɡl̩", "sentence": "Auf dem Hügel steht ein Baum."},
            {"word": "Prüfung", "ipa": "ˈpʁyːfʊŋ", "sentence": "Die Prüfung war schwer."},
            {"word": "Schlüssel", "ipa": "ˈʃlʏsl̩", "sentence": "Wo ist mein Schlüssel?"},
            {"word": "kühl", "ipa": "kyːl", "sentence": "Heute ist es kühl draußen."},
            {"word": "Übung", "ipa": "ˈyːbʊŋ", "sentence": "Übung macht den Meister."},
            {"word": "natürlich", "ipa": "naˈtyːɐ̯lɪç", "sentence": "Natürlich helfe ich dir."},
            {"word": "fühlen", "ipa": "ˈfyːlən", "sentence": "Wie fühlst du dich heute?"},
            {"word": "Gemüse", "ipa": "ɡəˈmyːzə", "sentence": "Gemüse ist gesund."}
        ]
    },
    {
        "sound_id": "sound_umlaut_oe",
        "phoneme_ipa": "ø",
        "name": "Umlaut ö",
        "description": "The German 'ö' is a close-mid front rounded vowel - you say 'e' with rounded lips.",
        "articulatory_tip": "Say 'e' (as in 'bed') but round your lips. Your tongue stays in the front of your mouth but your lips are pursed like you're going to say 'o'.",
        "difficulty_level": "advanced",
        "exercises": [
            {"word": "schön", "ipa": "ʃøːn", "sentence": "Das Wetter ist heute schön."},
            {"word": "hören", "ipa": "ˈhøːʁən", "sentence": "Kannst du mich hören?"},
            {"word": "mögen", "ipa": "ˈmøːɡən", "sentence": "Ich möge keine Spinnen."},
            {"word": "Löwe", "ipa": "ˈløːvə", "sentence": "Der Löwe ist der König der Tiere."},
            {"word": "böse", "ipa": "ˈbøːzə", "sentence": "Sei nicht böse auf mich."},
            {"word": "Köln", "ipa": "kœln", "sentence": "Köln ist eine große Stadt."},
            {"word": "können", "ipa": "ˈkœnən", "sentence": "Wir können das schaffen."},
            {"word": "möchten", "ipa": "ˈmœçtn̩", "sentence": "Möchten Sie Kaffee?"},
            {"word": "öffnen", "ipa": "ˈœfnən", "sentence": "Bitte öffnen Sie das Fenster."},
            {"word": "zwölf", "ipa": "t͡svœlf", "sentence": "Es ist zwölf Uhr."},
            {"word": "Töchter", "ipa": "ˈtœçtɐ", "sentence": "Er hat zwei Töchter."},
            {"word": "König", "ipa": "ˈkøːnɪç", "sentence": "Der König lebt im Schloss."},
            {"word": "Öl", "ipa": "øːl", "sentence": "Das Öl ist in der Küche."},
            {"word": "österreichisch", "ipa": "ˈøːstəʁaɪ̯çɪʃ", "sentence": "Er ist österreichisch."},
            {"word": "Größe", "ipa": "ˈɡʁøːsə", "sentence": "Welche Größe tragen Sie?"}
        ]
    },
    {
        "sound_id": "sound_r_german",
        "phoneme_ipa": "ʁ",
        "name": "German R",
        "description": "The German 'R' is produced at the back of the throat (uvular), not with the tongue tip like English or Spanish R.",
        "articulatory_tip": "Make a soft gargling sound at the back of your throat. The back of your tongue should vibrate against your uvula (the dangling bit at the back of your mouth). Don't roll it with your tongue tip!",
        "difficulty_level": "intermediate",
        "exercises": [
            {"word": "rot", "ipa": "ʁoːt", "sentence": "Die Ampel ist rot."},
            {"word": "richtig", "ipa": "ˈʁɪçtɪç", "sentence": "Das ist richtig."},
            {"word": "reisen", "ipa": "ˈʁaɪ̯zn̩", "sentence": "Ich reise gerne nach Italien."},
            {"word": "Regen", "ipa": "ˈʁeːɡən", "sentence": "Der Regen fällt vom Himmel."},
            {"word": "reden", "ipa": "ˈʁeːdn̩", "sentence": "Wir müssen darüber reden."},
            {"word": "Rad", "ipa": "ʁaːt", "sentence": "Ich fahre mit dem Rad zur Arbeit."},
            {"word": "rufen", "ipa": "ˈʁuːfn̩", "sentence": "Kannst du mich rufen?"},
            {"word": "rennen", "ipa": "ˈʁɛnən", "sentence": "Die Kinder rennen im Park."},
            {"word": "Reis", "ipa": "ʁaɪ̯s", "sentence": "Reis ist in Asien beliebt."},
            {"word": "grün", "ipa": "ɡʁyːn", "sentence": "Das Blatt ist grün."},
            {"word": "drei", "ipa": "dʁaɪ̯", "sentence": "Ich habe drei Bücher."},
            {"word": "Bruder", "ipa": "ˈbʁuːdɐ", "sentence": "Mein Bruder wohnt in Berlin."},
            {"word": "Freund", "ipa": "fʁɔɪ̯nt", "sentence": "Er ist mein bester Freund."},
            {"word": "groß", "ipa": "ɡʁoːs", "sentence": "Das Haus ist sehr groß."},
            {"word": "Frau", "ipa": "fʁaʊ̯", "sentence": "Die Frau liest ein Buch."}
        ]
    },
    {
        "sound_id": "sound_z_german",
        "phoneme_ipa": "t͡s",
        "name": "German Z",
        "description": "German 'z' is pronounced as 'ts' - like the 'ts' at the end of 'cats'.",
        "articulatory_tip": "Combine a 't' sound immediately followed by an 's' sound. It's one quick motion: t-s. Never pronounce it like an English 'z' (buzz).",
        "difficulty_level": "beginner",
        "exercises": [
            {"word": "zehn", "ipa": "t͡seːn", "sentence": "Ich zähle bis zehn."},
            {"word": "Zeit", "ipa": "t͡saɪ̯t", "sentence": "Hast du Zeit?"},
            {"word": "Zug", "ipa": "t͡suːk", "sentence": "Der Zug kommt um acht Uhr."},
            {"word": "Zimmer", "ipa": "ˈt͡sɪmɐ", "sentence": "Mein Zimmer ist klein."},
            {"word": "zahlen", "ipa": "ˈt͡saːlən", "sentence": "Ich möchte bitte zahlen."},
            {"word": "zeigen", "ipa": "ˈt͡saɪ̯ɡən", "sentence": "Können Sie mir das zeigen?"},
            {"word": "zusammen", "ipa": "t͡suˈzamən", "sentence": "Wir arbeiten zusammen."},
            {"word": "Zucker", "ipa": "ˈt͡sʊkɐ", "sentence": "Möchtest du Zucker im Kaffee?"},
            {"word": "zwischen", "ipa": "ˈt͡svɪʃn̩", "sentence": "Das Café ist zwischen der Bank und dem Kino."},
            {"word": "Herz", "ipa": "hɛʁt͡s", "sentence": "Das Herz schlägt schnell."},
            {"word": "kurz", "ipa": "kʊʁt͡s", "sentence": "Die Pause ist kurz."},
            {"word": "Arzt", "ipa": "aːɐ̯t͡st", "sentence": "Der Arzt untersucht den Patienten."},
            {"word": "Platz", "ipa": "plat͡s", "sentence": "Ist hier noch Platz?"},
            {"word": "Schatz", "ipa": "ʃat͡s", "sentence": "Mein Schatz, ich liebe dich."},
            {"word": "zwanzig", "ipa": "ˈt͡svant͡sɪç", "sentence": "Ich bin zwanzig Jahre alt."}
        ]
    }
]


async def upload_modules():
    """Upload pronunciation modules to MongoDB."""
    # Get MongoDB connection details from environment
    mongo_user = os.getenv("MONGO_USER")
    mongo_password = os.getenv("MONGO_PASSWORD")
    mongo_address = os.getenv("MONGO_ADDRESS")
    mongo_cluster = os.getenv("MONGO_CLUSTER", "hackathon")

    if not all([mongo_user, mongo_password, mongo_address]):
        print("Error: Missing MongoDB connection environment variables.")
        print("Please set MONGO_USER, MONGO_PASSWORD, and MONGO_ADDRESS")
        sys.exit(1)

    uri = f"mongodb+srv://{mongo_user}:{mongo_password}@{mongo_address}/?appName={mongo_cluster}"

    print(f"Connecting to MongoDB...")
    client = AsyncIOMotorClient(uri)
    db = client.get_database("hackathon")

    collection = db["pronunciation_modules"]

    # Check existing modules
    existing_count = await collection.count_documents({})
    print(f"Found {existing_count} existing modules in the database.")

    if existing_count > 0:
        response = input("Do you want to replace existing modules? (y/N): ").strip().lower()
        if response == 'y':
            result = await collection.delete_many({})
            print(f"Deleted {result.deleted_count} existing modules.")
        else:
            print("Keeping existing modules. Will update matching ones.")

    # Insert/update modules
    inserted_count = 0
    updated_count = 0

    for module in PRONUNCIATION_MODULES:
        result = await collection.update_one(
            {"sound_id": module["sound_id"]},
            {"$set": module},
            upsert=True
        )
        if result.upserted_id:
            inserted_count += 1
        elif result.modified_count > 0:
            updated_count += 1

    print(f"\nUpload complete!")
    print(f"  - Inserted: {inserted_count} new modules")
    print(f"  - Updated: {updated_count} existing modules")

    # Verify
    final_count = await collection.count_documents({})
    print(f"  - Total modules in database: {final_count}")

    # Create indexes
    await collection.create_index("sound_id", unique=True)
    await collection.create_index("difficulty_level")
    await collection.create_index("phoneme_ipa")
    print("  - Created indexes on 'sound_id' (unique), 'difficulty_level', and 'phoneme_ipa'")

    # Create indexes for sessions and progress collections
    sessions_collection = db["pronunciation_sessions"]
    await sessions_collection.create_index([("userId", 1), ("createdAt", -1)])
    await sessions_collection.create_index([("userId", 1), ("sound_id", 1)])
    print("  - Created indexes on pronunciation_sessions collection")

    progress_collection = db["user_pronunciation_progress"]
    await progress_collection.create_index([("userId", 1), ("sound_id", 1)], unique=True)
    print("  - Created indexes on user_pronunciation_progress collection")

    # List modules
    print(f"\nAvailable pronunciation modules:")
    for module in PRONUNCIATION_MODULES:
        print(f"\n  {module['name']} ({module['phoneme_ipa']})")
        print(f"    Difficulty: {module['difficulty_level']}")
        print(f"    Exercises: {len(module['exercises'])}")
        print(f"    Description: {module['description'][:50]}...")

    client.close()
    print("\nDone!")


if __name__ == "__main__":
    asyncio.run(upload_modules())
