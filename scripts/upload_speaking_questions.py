"""
Script to upload speaking questions to MongoDB.

Usage:
    python scripts/upload_speaking_questions.py

This will upload predefined speaking questions to the 'speaking_questions' collection.
"""

import asyncio
import os
import sys

# Add parent directory to path for imports
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv

load_dotenv()

# Speaking questions data - organized by level
# Each target_word is now an object with "word" and "translation"

A1_QUESTIONS = [
    {
        "id": 1,
        "level": "A1",
        "theme": "Introduction",
        "question": "Wie heißt du und woher kommst du?",
        "question_en": "What is your name and where do you come from?",
        "target_words": [
            {"word": "Name", "translation": "name"},
            {"word": "kommen", "translation": "to come"},
            {"word": "Land", "translation": "country"}
        ]
    },
    {
        "id": 2,
        "level": "A1",
        "theme": "Hobbies",
        "question": "Was machst du gern in deiner Freizeit?",
        "question_en": "What do you like to do in your free time?",
        "target_words": [
            {"word": "Sport", "translation": "sport"},
            {"word": "lesen", "translation": "to read"},
            {"word": "Musik", "translation": "music"}
        ]
    },
    {
        "id": 3,
        "level": "A1",
        "theme": "Family",
        "question": "Erzähl mir von deiner Familie.",
        "question_en": "Tell me about your family.",
        "target_words": [
            {"word": "Bruder", "translation": "brother"},
            {"word": "Schwester", "translation": "sister"},
            {"word": "Eltern", "translation": "parents"}
        ]
    },
    {
        "id": 4,
        "level": "A1",
        "theme": "Food & Drink",
        "question": "Was isst du gern zum Frühstück?",
        "question_en": "What do you like to eat for breakfast?",
        "target_words": [
            {"word": "Brot", "translation": "bread"},
            {"word": "Kaffee", "translation": "coffee"},
            {"word": "Ei", "translation": "egg"}
        ]
    },
    {
        "id": 5,
        "level": "A1",
        "theme": "Work",
        "question": "Was bist du von Beruf?",
        "question_en": "What is your job?",
        "target_words": [
            {"word": "arbeiten", "translation": "to work"},
            {"word": "Büro", "translation": "office"},
            {"word": "Kollege", "translation": "colleague"}
        ]
    },
    {
        "id": 6,
        "level": "A1",
        "theme": "Shopping",
        "question": "Was möchtest du im Supermarkt kaufen?",
        "question_en": "What would you like to buy at the supermarket?",
        "target_words": [
            {"word": "Milch", "translation": "milk"},
            {"word": "teuer", "translation": "expensive"},
            {"word": "Euro", "translation": "euro"}
        ]
    },
    {
        "id": 7,
        "level": "A1",
        "theme": "Daily Routine",
        "question": "Wann stehst du morgens auf?",
        "question_en": "When do you get up in the morning?",
        "target_words": [
            {"word": "Uhr", "translation": "clock/time"},
            {"word": "früh", "translation": "early"},
            {"word": "morgen", "translation": "morning/tomorrow"}
        ]
    },
    {
        "id": 8,
        "level": "A1",
        "theme": "Weekend",
        "question": "Was machst du am Wochenende?",
        "question_en": "What do you do on the weekend?",
        "target_words": [
            {"word": "Samstag", "translation": "Saturday"},
            {"word": "Freunde", "translation": "friends"},
            {"word": "schlafen", "translation": "to sleep"}
        ]
    },
    {
        "id": 9,
        "level": "A1",
        "theme": "Home",
        "question": "Wie ist deine Wohnung?",
        "question_en": "What is your apartment like?",
        "target_words": [
            {"word": "groß", "translation": "big"},
            {"word": "Zimmer", "translation": "room"},
            {"word": "Küche", "translation": "kitchen"}
        ]
    },
    {
        "id": 10,
        "level": "A1",
        "theme": "Weather",
        "question": "Wie ist das Wetter heute?",
        "question_en": "How is the weather today?",
        "target_words": [
            {"word": "Sonne", "translation": "sun"},
            {"word": "kalt", "translation": "cold"},
            {"word": "regnen", "translation": "to rain"}
        ]
    },
    {
        "id": 11,
        "level": "A1",
        "theme": "Transport",
        "question": "Wie fährst du zur Arbeit oder zur Schule?",
        "question_en": "How do you go to work or school?",
        "target_words": [
            {"word": "Bus", "translation": "bus"},
            {"word": "Auto", "translation": "car"},
            {"word": "Zug", "translation": "train"}
        ]
    },
    {
        "id": 12,
        "level": "A1",
        "theme": "Restaurant",
        "question": "Was möchten Sie bestellen?",
        "question_en": "What would you like to order?",
        "target_words": [
            {"word": "Wasser", "translation": "water"},
            {"word": "Fleisch", "translation": "meat"},
            {"word": "Rechnung", "translation": "bill"}
        ]
    },
    {
        "id": 13,
        "level": "A1",
        "theme": "Clothing",
        "question": "Was trägst du heute?",
        "question_en": "What are you wearing today?",
        "target_words": [
            {"word": "Hose", "translation": "pants"},
            {"word": "blau", "translation": "blue"},
            {"word": "T-Shirt", "translation": "t-shirt"}
        ]
    },
    {
        "id": 14,
        "level": "A1",
        "theme": "Language Learning",
        "question": "Warum lernst du Deutsch?",
        "question_en": "Why are you learning German?",
        "target_words": [
            {"word": "Sprache", "translation": "language"},
            {"word": "verstehen", "translation": "to understand"},
            {"word": "lernen", "translation": "to learn"}
        ]
    },
    {
        "id": 15,
        "level": "A1",
        "theme": "Travel",
        "question": "Wohin reist du gern im Urlaub?",
        "question_en": "Where do you like to travel on vacation?",
        "target_words": [
            {"word": "Meer", "translation": "sea"},
            {"word": "Strand", "translation": "beach"},
            {"word": "Flugzeug", "translation": "airplane"}
        ]
    },
    {
        "id": 16,
        "level": "A1",
        "theme": "City",
        "question": "Was gibt es in deiner Stadt?",
        "question_en": "What is there in your city?",
        "target_words": [
            {"word": "Park", "translation": "park"},
            {"word": "Bahnhof", "translation": "train station"},
            {"word": "Kino", "translation": "cinema"}
        ]
    },
    {
        "id": 17,
        "level": "A1",
        "theme": "Health",
        "question": "Wie geht es dir heute?",
        "question_en": "How are you today?",
        "target_words": [
            {"word": "gut", "translation": "good"},
            {"word": "müde", "translation": "tired"},
            {"word": "Kopfschmerzen", "translation": "headache"}
        ]
    },
    {
        "id": 18,
        "level": "A1",
        "theme": "Furniture",
        "question": "Was hast du in deinem Wohnzimmer?",
        "question_en": "What do you have in your living room?",
        "target_words": [
            {"word": "Tisch", "translation": "table"},
            {"word": "Sofa", "translation": "sofa"},
            {"word": "Fernseher", "translation": "television"}
        ]
    },
    {
        "id": 19,
        "level": "A1",
        "theme": "Birthday",
        "question": "Wann hast du Geburtstag?",
        "question_en": "When is your birthday?",
        "target_words": [
            {"word": "Jahr", "translation": "year"},
            {"word": "Party", "translation": "party"},
            {"word": "Geschenk", "translation": "gift"}
        ]
    },
    {
        "id": 20,
        "level": "A1",
        "theme": "Pets",
        "question": "Hast du ein Haustier?",
        "question_en": "Do you have a pet?",
        "target_words": [
            {"word": "Hund", "translation": "dog"},
            {"word": "Katze", "translation": "cat"},
            {"word": "lieb", "translation": "sweet/dear"}
        ]
    },
    {
        "id": 21,
        "level": "A1",
        "theme": "Evening",
        "question": "Was machst du am Abend?",
        "question_en": "What do you do in the evening?",
        "target_words": [
            {"word": "fernsehen", "translation": "to watch TV"},
            {"word": "Buch", "translation": "book"},
            {"word": "essen", "translation": "to eat"}
        ]
    },
    {
        "id": 22,
        "level": "A1",
        "theme": "Directions",
        "question": "Wo ist die Toilette, bitte?",
        "question_en": "Where is the toilet, please?",
        "target_words": [
            {"word": "links", "translation": "left"},
            {"word": "rechts", "translation": "right"},
            {"word": "geradeaus", "translation": "straight ahead"}
        ]
    },
    {
        "id": 23,
        "level": "A1",
        "theme": "Colors",
        "question": "Was ist deine Lieblingsfarbe?",
        "question_en": "What is your favorite color?",
        "target_words": [
            {"word": "rot", "translation": "red"},
            {"word": "grün", "translation": "green"},
            {"word": "schwarz", "translation": "black"}
        ]
    },
    {
        "id": 24,
        "level": "A1",
        "theme": "Appointments",
        "question": "Hast du am Montag Zeit?",
        "question_en": "Do you have time on Monday?",
        "target_words": [
            {"word": "Termin", "translation": "appointment"},
            {"word": "Woche", "translation": "week"},
            {"word": "treffen", "translation": "to meet"}
        ]
    },
    {
        "id": 25,
        "level": "A1",
        "theme": "Restaurant Payment",
        "question": "Möchten Sie bar oder mit Karte zahlen?",
        "question_en": "Would you like to pay cash or by card?",
        "target_words": [
            {"word": "Karte", "translation": "card"},
            {"word": "bezahlen", "translation": "to pay"},
            {"word": "bitte", "translation": "please"}
        ]
    }
]

A2_QUESTIONS = [
    {
        "id": 101,
        "level": "A2",
        "theme": "Last Vacation (Past Tense)",
        "question": "Wo warst du in deinem letzten Urlaub und was hast du gemacht?",
        "question_en": "Where were you on your last vacation and what did you do?",
        "target_words": [
            {"word": "gereist", "translation": "traveled"},
            {"word": "Meer", "translation": "sea"},
            {"word": "besichtigt", "translation": "visited/toured"}
        ]
    },
    {
        "id": 102,
        "level": "A2",
        "theme": "Weekend Activities (Past Tense)",
        "question": "Was hast du am letzten Wochenende gemacht?",
        "question_en": "What did you do last weekend?",
        "target_words": [
            {"word": "Freunde", "translation": "friends"},
            {"word": "getroffen", "translation": "met"},
            {"word": "ausgegangen", "translation": "went out"}
        ]
    },
    {
        "id": 103,
        "level": "A2",
        "theme": "Shopping for Clothes",
        "question": "Du möchtest eine Jacke kaufen. Was sagst du zum Verkäufer?",
        "question_en": "You want to buy a jacket. What do you say to the salesperson?",
        "target_words": [
            {"word": "Größe", "translation": "size"},
            {"word": "anprobieren", "translation": "to try on"},
            {"word": "passen", "translation": "to fit"}
        ]
    },
    {
        "id": 104,
        "level": "A2",
        "theme": "Health & Sickness",
        "question": "Du bist krank und rufst deinen Chef an. Was sagst du?",
        "question_en": "You are sick and calling your boss. What do you say?",
        "target_words": [
            {"word": "Fieber", "translation": "fever"},
            {"word": "Arzt", "translation": "doctor"},
            {"word": "heute", "translation": "today"}
        ]
    },
    {
        "id": 105,
        "level": "A2",
        "theme": "Future Plans",
        "question": "Was sind deine Pläne für den nächsten Sommer?",
        "question_en": "What are your plans for next summer?",
        "target_words": [
            {"word": "werden", "translation": "will/to become"},
            {"word": "reisen", "translation": "to travel"},
            {"word": "besuchen", "translation": "to visit"}
        ]
    },
    {
        "id": 106,
        "level": "A2",
        "theme": "Restaurant Complaint",
        "question": "Das Essen im Restaurant ist kalt. Was sagst du zum Kellner?",
        "question_en": "The food in the restaurant is cold. What do you say to the waiter?",
        "target_words": [
            {"word": "Entschuldigung", "translation": "excuse me/sorry"},
            {"word": "kalt", "translation": "cold"},
            {"word": "zurückgeben", "translation": "to return/give back"}
        ]
    },
    {
        "id": 107,
        "level": "A2",
        "theme": "Daily Routine (Reflexive)",
        "question": "Wie sieht ein normaler Arbeitstag bei dir aus?",
        "question_en": "What does a normal workday look like for you?",
        "target_words": [
            {"word": "aufstehen", "translation": "to get up"},
            {"word": "duschen", "translation": "to shower"},
            {"word": "Büro", "translation": "office"}
        ]
    },
    {
        "id": 108,
        "level": "A2",
        "theme": "Directions",
        "question": "Ein Tourist fragt nach dem Weg zum Bahnhof. Wie hilfst du ihm?",
        "question_en": "A tourist asks for the way to the train station. How do you help him?",
        "target_words": [
            {"word": "abbiegen", "translation": "to turn"},
            {"word": "Ampel", "translation": "traffic light"},
            {"word": "geradeaus", "translation": "straight ahead"}
        ]
    },
    {
        "id": 109,
        "level": "A2",
        "theme": "Invitations",
        "question": "Du möchtest deinen Freund ins Kino einladen. Was fragst du ihn?",
        "question_en": "You want to invite your friend to the cinema. What do you ask him?",
        "target_words": [
            {"word": "Lust", "translation": "desire/feel like"},
            {"word": "Zeit", "translation": "time"},
            {"word": "Film", "translation": "film/movie"}
        ]
    },
    {
        "id": 110,
        "level": "A2",
        "theme": "Moving House",
        "question": "Beschreibe deine Traumwohnung.",
        "question_en": "Describe your dream apartment.",
        "target_words": [
            {"word": "Balkon", "translation": "balcony"},
            {"word": "hell", "translation": "bright"},
            {"word": "Zentrum", "translation": "center"}
        ]
    },
    {
        "id": 111,
        "level": "A2",
        "theme": "Education/School",
        "question": "Welches Fach hast du in der Schule gemocht und warum?",
        "question_en": "Which subject did you like in school and why?",
        "target_words": [
            {"word": "Mathe", "translation": "math"},
            {"word": "interessant", "translation": "interesting"},
            {"word": "Lehrer", "translation": "teacher"}
        ]
    },
    {
        "id": 112,
        "level": "A2",
        "theme": "Technology",
        "question": "Wie oft benutzt du dein Handy und wofür?",
        "question_en": "How often do you use your cell phone and for what?",
        "target_words": [
            {"word": "Nachrichten", "translation": "messages/news"},
            {"word": "Internet", "translation": "internet"},
            {"word": "schicken", "translation": "to send"}
        ]
    },
    {
        "id": 113,
        "level": "A2",
        "theme": "Gifts",
        "question": "Deine Mutter hat Geburtstag. Was schenkst du ihr?",
        "question_en": "It is your mother's birthday. What do you give her?",
        "target_words": [
            {"word": "Blumen", "translation": "flowers"},
            {"word": "Parfüm", "translation": "perfume"},
            {"word": "Idee", "translation": "idea"}
        ]
    },
    {
        "id": 114,
        "level": "A2",
        "theme": "Public Transport",
        "question": "Der Zug hat Verspätung. Du sprichst mit einem anderen Fahrgast.",
        "question_en": "The train is delayed. You speak to another passenger.",
        "target_words": [
            {"word": "warten", "translation": "to wait"},
            {"word": "Minuten", "translation": "minutes"},
            {"word": "Anschluss", "translation": "connection"}
        ]
    },
    {
        "id": 115,
        "level": "A2",
        "theme": "Comparison",
        "question": "Wohnst du lieber in der Stadt oder auf dem Land? Warum?",
        "question_en": "Do you prefer living in the city or in the country? Why?",
        "target_words": [
            {"word": "laut", "translation": "loud"},
            {"word": "ruhig", "translation": "quiet"},
            {"word": "besser", "translation": "better"}
        ]
    },
    {
        "id": 116,
        "level": "A2",
        "theme": "Cooking",
        "question": "Was ist dein Lieblingsgericht und kannst du es kochen?",
        "question_en": "What is your favorite dish and can you cook it?",
        "target_words": [
            {"word": "Rezept", "translation": "recipe"},
            {"word": "Zutaten", "translation": "ingredients"},
            {"word": "lecker", "translation": "delicious"}
        ]
    }
]

B1_QUESTIONS = [
    {
        "id": 201,
        "level": "B1",
        "theme": "Social Media",
        "question": "Was sind die Vor- und Nachteile von sozialen Medien deiner Meinung nach?",
        "question_en": "In your opinion, what are the advantages and disadvantages of social media?",
        "target_words": [
            {"word": "Vorteil", "translation": "advantage"},
            {"word": "Nachteil", "translation": "disadvantage"},
            {"word": "kommunizieren", "translation": "to communicate"}
        ]
    },
    {
        "id": 202,
        "level": "B1",
        "theme": "Environment",
        "question": "Was machst du persönlich für den Umweltschutz?",
        "question_en": "What do you personally do for environmental protection?",
        "target_words": [
            {"word": "Müll trennen", "translation": "to separate waste"},
            {"word": "Umwelt", "translation": "environment"},
            {"word": "vermeiden", "translation": "to avoid"}
        ]
    },
    {
        "id": 203,
        "level": "B1",
        "theme": "Work-Life Balance",
        "question": "Was ist wichtiger: Ein hohes Gehalt oder nette Kollegen? Begründe deine Meinung.",
        "question_en": "What is more important: A high salary or nice colleagues? Justify your opinion.",
        "target_words": [
            {"word": "Gehalt", "translation": "salary"},
            {"word": "Betriebsklima", "translation": "work atmosphere"},
            {"word": "zufrieden", "translation": "satisfied"}
        ]
    },
    {
        "id": 204,
        "level": "B1",
        "theme": "Healthy Lifestyle",
        "question": "Was bedeutet für dich ein gesundes Leben?",
        "question_en": "What does a healthy life mean to you?",
        "target_words": [
            {"word": "Ernährung", "translation": "nutrition/diet"},
            {"word": "bewegen", "translation": "to move/exercise"},
            {"word": "Stress", "translation": "stress"}
        ]
    },
    {
        "id": 205,
        "level": "B1",
        "theme": "Travel Experiences",
        "question": "Erzähl von einer Reise, die du nie vergessen wirst. Was ist passiert?",
        "question_en": "Tell about a trip you will never forget. What happened?",
        "target_words": [
            {"word": "Erlebnis", "translation": "experience"},
            {"word": "überrascht", "translation": "surprised"},
            {"word": "Kultur", "translation": "culture"}
        ]
    },
    {
        "id": 206,
        "level": "B1",
        "theme": "Online Shopping",
        "question": "Kaufst du lieber im Internet oder im Geschäft ein? Warum?",
        "question_en": "Do you prefer shopping on the internet or in a store? Why?",
        "target_words": [
            {"word": "bestellen", "translation": "to order"},
            {"word": "anprobieren", "translation": "to try on"},
            {"word": "Auswahl", "translation": "selection/choice"}
        ]
    },
    {
        "id": 207,
        "level": "B1",
        "theme": "Public Transport vs Car",
        "question": "Sollte man in der Innenstadt das Autofahren verbieten?",
        "question_en": "Should driving be banned in the city center?",
        "target_words": [
            {"word": "Verkehrsmittel", "translation": "means of transport"},
            {"word": "Stau", "translation": "traffic jam"},
            {"word": "Luftverschmutzung", "translation": "air pollution"}
        ]
    },
    {
        "id": 208,
        "level": "B1",
        "theme": "Future Plans",
        "question": "Wo siehst du dich beruflich in fünf Jahren?",
        "question_en": "Where do you see yourself professionally in five years?",
        "target_words": [
            {"word": "Karriere", "translation": "career"},
            {"word": "Fortbildung", "translation": "further education"},
            {"word": "erreichen", "translation": "to achieve"}
        ]
    },
    {
        "id": 209,
        "level": "B1",
        "theme": "Learning Languages",
        "question": "Was findest du am schwierigsten beim Deutschlernen?",
        "question_en": "What do you find most difficult about learning German?",
        "target_words": [
            {"word": "Grammatik", "translation": "grammar"},
            {"word": "Aussprache", "translation": "pronunciation"},
            {"word": "üben", "translation": "to practice"}
        ]
    },
    {
        "id": 210,
        "level": "B1",
        "theme": "Friendship",
        "question": "Was macht einen guten Freund oder eine gute Freundin aus?",
        "question_en": "What makes a good friend?",
        "target_words": [
            {"word": "vertrauen", "translation": "to trust"},
            {"word": "zuverlässig", "translation": "reliable"},
            {"word": "helfen", "translation": "to help"}
        ]
    },
    {
        "id": 211,
        "level": "B1",
        "theme": "Housing",
        "question": "Würdest du lieber in einer kleinen Wohnung im Zentrum oder in einem großen Haus auf dem Land wohnen?",
        "question_en": "Would you rather live in a small apartment in the center or a large house in the country?",
        "target_words": [
            {"word": "Miete", "translation": "rent"},
            {"word": "Lage", "translation": "location"},
            {"word": "Nachbarn", "translation": "neighbors"}
        ]
    },
    {
        "id": 212,
        "level": "B1",
        "theme": "Complaint (Service)",
        "question": "Du hast ein kaputtes Produkt erhalten. Beschwere dich beim Kundenservice.",
        "question_en": "You received a broken product. Complain to customer service.",
        "target_words": [
            {"word": "beschädigt", "translation": "damaged"},
            {"word": "umtauschen", "translation": "to exchange"},
            {"word": "Geld zurück", "translation": "money back"}
        ]
    },
    {
        "id": 213,
        "level": "B1",
        "theme": "Movies & Series",
        "question": "Welchen Film hast du zuletzt gesehen und worum ging es?",
        "question_en": "Which movie did you watch last and what was it about?",
        "target_words": [
            {"word": "Handlung", "translation": "plot"},
            {"word": "Schauspieler", "translation": "actor"},
            {"word": "spannend", "translation": "exciting"}
        ]
    },
    {
        "id": 214,
        "level": "B1",
        "theme": "Festivals & Traditions",
        "question": "Welches Fest ist in deinem Heimatland besonders wichtig und wie feiert man es?",
        "question_en": "Which festival is particularly important in your home country and how is it celebrated?",
        "target_words": [
            {"word": "Tradition", "translation": "tradition"},
            {"word": "feiern", "translation": "to celebrate"},
            {"word": "Familie", "translation": "family"}
        ]
    },
    {
        "id": 215,
        "level": "B1",
        "theme": "Technology in Daily Life",
        "question": "Könntest du eine Woche ohne Internet leben?",
        "question_en": "Could you live a week without the internet?",
        "target_words": [
            {"word": "abhängig", "translation": "dependent"},
            {"word": "Smartphone", "translation": "smartphone"},
            {"word": "Informationen", "translation": "information"}
        ]
    },
    {
        "id": 216,
        "level": "B1",
        "theme": "Eating Habits",
        "question": "Wie hat sich deine Ernährung in den letzten Jahren verändert?",
        "question_en": "How has your diet changed in the last few years?",
        "target_words": [
            {"word": "vegetarisch", "translation": "vegetarian"},
            {"word": "kochen", "translation": "to cook"},
            {"word": "Gesundheit", "translation": "health"}
        ]
    },
    {
        "id": 217,
        "level": "B1",
        "theme": "Advice to a Friend",
        "question": "Dein Freund hat Liebeskummer. Welchen Rat gibst du ihm?",
        "question_en": "Your friend is lovesick. What advice do you give him?",
        "target_words": [
            {"word": "vorschlagen", "translation": "to suggest"},
            {"word": "ablenken", "translation": "to distract"},
            {"word": "reden", "translation": "to talk"}
        ]
    },
    {
        "id": 218,
        "level": "B1",
        "theme": "Job Interview (Strengths)",
        "question": "Was sind deine größten Stärken und Schwächen?",
        "question_en": "What are your greatest strengths and weaknesses?",
        "target_words": [
            {"word": "organisiert", "translation": "organized"},
            {"word": "Geduld", "translation": "patience"},
            {"word": "Teamfähigkeit", "translation": "teamwork skills"}
        ]
    },
    {
        "id": 219,
        "level": "B1",
        "theme": "School System",
        "question": "Was würdest du am Schulsystem ändern, wenn du könntest?",
        "question_en": "What would you change about the school system if you could?",
        "target_words": [
            {"word": "Unterricht", "translation": "lesson/class"},
            {"word": "Noten", "translation": "grades"},
            {"word": "verbessern", "translation": "to improve"}
        ]
    },
    {
        "id": 220,
        "level": "B1",
        "theme": "Volunteering",
        "question": "Hältst du ehrenamtliche Arbeit für wichtig?",
        "question_en": "Do you consider volunteer work important?",
        "target_words": [
            {"word": "Gesellschaft", "translation": "society"},
            {"word": "unterstützen", "translation": "to support"},
            {"word": "Erfahrung", "translation": "experience"}
        ]
    },
    {
        "id": 221,
        "level": "B1",
        "theme": "News & Media",
        "question": "Wie informierst du dich über aktuelle Nachrichten?",
        "question_en": "How do you inform yourself about current news?",
        "target_words": [
            {"word": "Zeitung", "translation": "newspaper"},
            {"word": "Online", "translation": "online"},
            {"word": "glauben", "translation": "to believe"}
        ]
    },
    {
        "id": 222,
        "level": "B1",
        "theme": "Stress Management",
        "question": "Was machst du, wenn du viel Stress hast?",
        "question_en": "What do you do when you have a lot of stress?",
        "target_words": [
            {"word": "entspannen", "translation": "to relax"},
            {"word": "Ruhe", "translation": "peace/quiet"},
            {"word": "ausgleichen", "translation": "to balance"}
        ]
    },
    {
        "id": 223,
        "level": "B1",
        "theme": "Fashion & Clothing",
        "question": "Ist dir Mode wichtig oder ist Kleidung nur praktisch für dich?",
        "question_en": "Is fashion important to you or is clothing just practical for you?",
        "target_words": [
            {"word": "Stil", "translation": "style"},
            {"word": "Marken", "translation": "brands"},
            {"word": "tragen", "translation": "to wear"}
        ]
    },
    {
        "id": 224,
        "level": "B1",
        "theme": "Childhood Memories",
        "question": "Was war dein liebstes Spielzeug als Kind?",
        "question_en": "What was your favorite toy as a child?",
        "target_words": [
            {"word": "erinnern", "translation": "to remember"},
            {"word": "spielen", "translation": "to play"},
            {"word": "damals", "translation": "back then"}
        ]
    },
    {
        "id": 225,
        "level": "B1",
        "theme": "Cultural Differences",
        "question": "Was ist der größte Unterschied zwischen Deutschland und deinem Heimatland?",
        "question_en": "What is the biggest difference between Germany and your home country?",
        "target_words": [
            {"word": "Mentalität", "translation": "mentality"},
            {"word": "Pünktlichkeit", "translation": "punctuality"},
            {"word": "anders", "translation": "different"}
        ]
    }
]

B2_QUESTIONS = [
    {
        "id": 301,
        "level": "B2",
        "theme": "Remote Work / Home Office",
        "question": "Ist das Arbeiten im Homeoffice ein Modell für die Zukunft? Nenne Vor- und Nachteile.",
        "question_en": "Is working from home a model for the future? Name advantages and disadvantages.",
        "target_words": [
            {"word": "Effizienz", "translation": "efficiency"},
            {"word": "pendeln", "translation": "to commute"},
            {"word": "Trennung", "translation": "separation"}
        ]
    },
    {
        "id": 302,
        "level": "B2",
        "theme": "Artificial Intelligence",
        "question": "Wird künstliche Intelligenz in Zukunft viele Arbeitsplätze ersetzen?",
        "question_en": "Will artificial intelligence replace many jobs in the future?",
        "target_words": [
            {"word": "ersetzen", "translation": "to replace"},
            {"word": "Fortschritt", "translation": "progress"},
            {"word": "Bedrohung", "translation": "threat"}
        ]
    },
    {
        "id": 303,
        "level": "B2",
        "theme": "Climate Change Responsibility",
        "question": "Wer trägt mehr Verantwortung für den Klimaschutz: Der Einzelne oder die Regierung?",
        "question_en": "Who bears more responsibility for climate protection: The individual or the government?",
        "target_words": [
            {"word": "Maßnahmen", "translation": "measures"},
            {"word": "Verantwortung", "translation": "responsibility"},
            {"word": "Nachhaltigkeit", "translation": "sustainability"}
        ]
    },
    {
        "id": 304,
        "level": "B2",
        "theme": "Globalization",
        "question": "Welche Auswirkungen hat die Globalisierung auf die lokale Kultur?",
        "question_en": "What effects does globalization have on local culture?",
        "target_words": [
            {"word": "Einfluss", "translation": "influence"},
            {"word": "Vielfalt", "translation": "diversity"},
            {"word": "bewahren", "translation": "to preserve"}
        ]
    },
    {
        "id": 305,
        "level": "B2",
        "theme": "Education vs. Experience",
        "question": "Was ist wichtiger für die Karriere: Ein Universitätsabschluss oder praktische Erfahrung?",
        "question_en": "What is more important for a career: A university degree or practical experience?",
        "target_words": [
            {"word": "Fachwissen", "translation": "expertise"},
            {"word": "Voraussetzung", "translation": "prerequisite"},
            {"word": "Kompetenz", "translation": "competence"}
        ]
    },
    {
        "id": 306,
        "level": "B2",
        "theme": "Data Privacy",
        "question": "Sind wir bereit, unsere Privatsphäre für mehr Sicherheit oder Komfort aufzugeben?",
        "question_en": "Are we willing to give up our privacy for more security or convenience?",
        "target_words": [
            {"word": "Datenschutz", "translation": "data protection"},
            {"word": "überwachen", "translation": "to monitor"},
            {"word": "transparent", "translation": "transparent"}
        ]
    },
    {
        "id": 307,
        "level": "B2",
        "theme": "Consumerism",
        "question": "Leben wir in einer Wegwerfgesellschaft? Sollten wir unser Konsumverhalten ändern?",
        "question_en": "Do we live in a throwaway society? Should we change our consumer behavior?",
        "target_words": [
            {"word": "Konsum", "translation": "consumption"},
            {"word": "reparieren", "translation": "to repair"},
            {"word": "Qualität", "translation": "quality"}
        ]
    },
    {
        "id": 308,
        "level": "B2",
        "theme": "Urbanization",
        "question": "Was sind die größten Herausforderungen für Großstädte in den nächsten 20 Jahren?",
        "question_en": "What are the biggest challenges for big cities in the next 20 years?",
        "target_words": [
            {"word": "Infrastruktur", "translation": "infrastructure"},
            {"word": "Mietpreise", "translation": "rental prices"},
            {"word": "Bevölkerungswachstum", "translation": "population growth"}
        ]
    },
    {
        "id": 309,
        "level": "B2",
        "theme": "Mental Health",
        "question": "Warum wird das Thema psychische Gesundheit am Arbeitsplatz immer wichtiger?",
        "question_en": "Why is the topic of mental health in the workplace becoming increasingly important?",
        "target_words": [
            {"word": "Leistungsdruck", "translation": "performance pressure"},
            {"word": "Burnout", "translation": "burnout"},
            {"word": "Wohlbefinden", "translation": "well-being"}
        ]
    },
    {
        "id": 310,
        "level": "B2",
        "theme": "Gender Equality",
        "question": "Ist die Gleichberechtigung von Männern und Frauen in der Gesellschaft bereits erreicht?",
        "question_en": "Has gender equality been achieved in society yet?",
        "target_words": [
            {"word": "Chancengleichheit", "translation": "equal opportunity"},
            {"word": "Gehalt", "translation": "salary"},
            {"word": "diskriminieren", "translation": "to discriminate"}
        ]
    },
    {
        "id": 311,
        "level": "B2",
        "theme": "Mass Tourism",
        "question": "Schadet der Massentourismus den Urlaubsorten mehr, als er nutzt?",
        "question_en": "Does mass tourism harm vacation spots more than it benefits them?",
        "target_words": [
            {"word": "Umweltbelastung", "translation": "environmental impact"},
            {"word": "Profitieren", "translation": "to profit"},
            {"word": "Einschränkung", "translation": "restriction"}
        ]
    },
    {
        "id": 312,
        "level": "B2",
        "theme": "Fake News & Media",
        "question": "Wie kann man erkennen, ob eine Nachricht wahr oder gefälscht ist?",
        "question_en": "How can one recognize if a news story is true or fake?",
        "target_words": [
            {"word": "Quelle", "translation": "source"},
            {"word": "kritisch", "translation": "critical"},
            {"word": "verbreiten", "translation": "to spread"}
        ]
    },
    {
        "id": 313,
        "level": "B2",
        "theme": "Hypothetical Politics",
        "question": "Wenn du Bundeskanzler wärst, welches Gesetz würdest du sofort einführen?",
        "question_en": "If you were Chancellor, which law would you introduce immediately?",
        "target_words": [
            {"word": "ändern", "translation": "to change"},
            {"word": "Regierung", "translation": "government"},
            {"word": "Priorität", "translation": "priority"}
        ]
    },
    {
        "id": 314,
        "level": "B2",
        "theme": "Language & Culture",
        "question": "Verliert man seine kulturelle Identität, wenn man in einem anderen Land lebt?",
        "question_en": "Do you lose your cultural identity when you live in another country?",
        "target_words": [
            {"word": "Integration", "translation": "integration"},
            {"word": "Wurzeln", "translation": "roots"},
            {"word": "anpassen", "translation": "to adapt"}
        ]
    },
    {
        "id": 315,
        "level": "B2",
        "theme": "Volunteer Work (Compulsory)",
        "question": "Sollte ein soziales Jahr für junge Menschen nach der Schule verpflichtend sein?",
        "question_en": "Should a social gap year be mandatory for young people after school?",
        "target_words": [
            {"word": "Gemeinschaft", "translation": "community"},
            {"word": "Pflicht", "translation": "duty/obligation"},
            {"word": "Reife", "translation": "maturity"}
        ]
    },
    {
        "id": 316,
        "level": "B2",
        "theme": "Cash vs. Digital Payment",
        "question": "Sollte Bargeld in Zukunft komplett abgeschafft werden?",
        "question_en": "Should cash be completely abolished in the future?",
        "target_words": [
            {"word": "Zahlungsmittel", "translation": "means of payment"},
            {"word": "Kontrolle", "translation": "control"},
            {"word": "bequem", "translation": "convenient"}
        ]
    },
    {
        "id": 317,
        "level": "B2",
        "theme": "Genetic Engineering",
        "question": "Ist Gentechnik in der Landwirtschaft eine Lösung für den Welthunger oder ein Risiko?",
        "question_en": "Is genetic engineering in agriculture a solution for world hunger or a risk?",
        "target_words": [
            {"word": "modifiziert", "translation": "modified"},
            {"word": "Ernährung", "translation": "nutrition"},
            {"word": "unabsehbar", "translation": "unforeseeable"}
        ]
    },
    {
        "id": 318,
        "level": "B2",
        "theme": "Success Definition",
        "question": "Wie definierst du persönlichen Erfolg? Ist er nur materiell messbar?",
        "question_en": "How do you define personal success? Is it only measurably materially?",
        "target_words": [
            {"word": "Zufriedenheit", "translation": "satisfaction"},
            {"word": "Status", "translation": "status"},
            {"word": "erreichen", "translation": "to achieve"}
        ]
    },
    {
        "id": 319,
        "level": "B2",
        "theme": "Aging Society",
        "question": "Welche Probleme entstehen durch den demografischen Wandel?",
        "question_en": "What problems arise from demographic change?",
        "target_words": [
            {"word": "Rente", "translation": "pension"},
            {"word": "Pflegekräfte", "translation": "caregivers"},
            {"word": "Generationenvertrag", "translation": "generational contract"}
        ]
    },
    {
        "id": 320,
        "level": "B2",
        "theme": "Learning Methods",
        "question": "Kann man eine Fremdsprache nur mit Apps wirklich fließend lernen?",
        "question_en": "Can one really learn a foreign language fluently using only apps?",
        "target_words": [
            {"word": "Interaktion", "translation": "interaction"},
            {"word": "Disziplin", "translation": "discipline"},
            {"word": "ergänzen", "translation": "to supplement"}
        ]
    },
    {
        "id": 321,
        "level": "B2",
        "theme": "Advertising Influence",
        "question": "Inwieweit beeinflusst Werbung unser Kaufverhalten?",
        "question_en": "To what extent does advertising influence our buying behavior?",
        "target_words": [
            {"word": "manipulieren", "translation": "to manipulate"},
            {"word": "Marke", "translation": "brand"},
            {"word": "Unterbewusstsein", "translation": "subconscious"}
        ]
    },
    {
        "id": 322,
        "level": "B2",
        "theme": "Nuclear Power",
        "question": "Ist Atomkraft eine notwendige Brückentechnologie oder zu gefährlich?",
        "question_en": "Is nuclear power a necessary bridging technology or too dangerous?",
        "target_words": [
            {"word": "Energieversorgung", "translation": "energy supply"},
            {"word": "Atommüll", "translation": "nuclear waste"},
            {"word": "Risiko", "translation": "risk"}
        ]
    },
    {
        "id": 323,
        "level": "B2",
        "theme": "Art and Vandalism",
        "question": "Ist Graffiti Kunst oder Sachbeschädigung?",
        "question_en": "Is graffiti art or property damage?",
        "target_words": [
            {"word": "Ausdrucksform", "translation": "form of expression"},
            {"word": "illegal", "translation": "illegal"},
            {"word": "Stadtbild", "translation": "cityscape"}
        ]
    },
    {
        "id": 324,
        "level": "B2",
        "theme": "Universal Basic Income",
        "question": "Was hältst du von der Idee eines bedingungslosen Grundeinkommens?",
        "question_en": "What do you think of the idea of a universal basic income?",
        "target_words": [
            {"word": "Finanzierung", "translation": "financing"},
            {"word": "Motivation", "translation": "motivation"},
            {"word": "Existenzminimum", "translation": "subsistence level"}
        ]
    },
    {
        "id": 325,
        "level": "B2",
        "theme": "Friendship vs. Networking",
        "question": "Ist 'Networking' nur eine moderne Form der Freundschaft oder reines Geschäft?",
        "question_en": "Is 'networking' just a modern form of friendship or purely business?",
        "target_words": [
            {"word": "Beziehung", "translation": "relationship"},
            {"word": "Nutzen", "translation": "benefit"},
            {"word": "oberflächlich", "translation": "superficial"}
        ]
    }
]

C1_QUESTIONS = [
    {
        "id": 401,
        "level": "C1",
        "theme": "Censorship & Free Speech",
        "question": "Wo endet die Meinungsfreiheit und wo beginnt Hate Speech? Nimm Stellung zur 'Cancel Culture'.",
        "question_en": "Where does freedom of speech end and hate speech begin? Take a stand on 'cancel culture'.",
        "target_words": [
            {"word": "Zensur", "translation": "censorship"},
            {"word": "Diskurs", "translation": "discourse"},
            {"word": "Konsequenz", "translation": "consequence"}
        ]
    },
    {
        "id": 402,
        "level": "C1",
        "theme": "Bioethics (Gene Editing)",
        "question": "Ist es ethisch vertretbar, das Erbgut von Menschen zu verändern, um Krankheiten zu heilen?",
        "question_en": "Is it ethically justifiable to alter human genetics to cure diseases?",
        "target_words": [
            {"word": "Eingriff", "translation": "intervention"},
            {"word": "kontrovers", "translation": "controversial"},
            {"word": "unabsehbar", "translation": "unforeseeable"}
        ]
    },
    {
        "id": 403,
        "level": "C1",
        "theme": "Gentrification",
        "question": "Wie verändert die Gentrifizierung das soziale Gefüge einer Stadt?",
        "question_en": "How does gentrification change the social fabric of a city?",
        "target_words": [
            {"word": "Verdrängung", "translation": "displacement"},
            {"word": "Aufwertung", "translation": "upgrading"},
            {"word": "Wohnraum", "translation": "living space"}
        ]
    },
    {
        "id": 404,
        "level": "C1",
        "theme": "Work Ethic & 4-Day Week",
        "question": "Führt eine Verkürzung der Arbeitszeit zu mehr Produktivität oder zu Wohlstandsverlust?",
        "question_en": "Does reducing working hours lead to more productivity or a loss of prosperity?",
        "target_words": [
            {"word": "Effizienz", "translation": "efficiency"},
            {"word": "Auswirkung", "translation": "impact"},
            {"word": "umsetzen", "translation": "to implement"}
        ]
    },
    {
        "id": 405,
        "level": "C1",
        "theme": "Artificial Intelligence & Ethics",
        "question": "Sollten wir KI-Systemen moralische Entscheidungen überlassen (z.B. beim autonomen Fahren)?",
        "question_en": "Should we leave moral decisions to AI systems (e.g., in autonomous driving)?",
        "target_words": [
            {"word": "Dilemma", "translation": "dilemma"},
            {"word": "Verantwortung", "translation": "responsibility"},
            {"word": "programmieren", "translation": "to program"}
        ]
    },
    {
        "id": 406,
        "level": "C1",
        "theme": "Language Evolution",
        "question": "Verdirbt die Jugendsprache oder der Einfluss des Englischen die deutsche Sprache?",
        "question_en": "Does youth slang or the influence of English spoil the German language?",
        "target_words": [
            {"word": "Sprachwandel", "translation": "language change"},
            {"word": "bereichern", "translation": "to enrich"},
            {"word": "verfallen", "translation": "to decay"}
        ]
    },
    {
        "id": 407,
        "level": "C1",
        "theme": "Globalization vs. Localization",
        "question": "Führt die Globalisierung zu einer kulturellen Einheitsbrei oder fördert sie den Austausch?",
        "question_en": "Does globalization lead to cultural uniformity or does it promote exchange?",
        "target_words": [
            {"word": "Homogenisierung", "translation": "homogenization"},
            {"word": "Identität", "translation": "identity"},
            {"word": "bewahren", "translation": "to preserve"}
        ]
    },
    {
        "id": 408,
        "level": "C1",
        "theme": "The Role of Arts",
        "question": "Ist Kunst systemrelevant oder ein Luxusgut, das man in Krisenzeiten vernachlässigen kann?",
        "question_en": "Is art systematically relevant or a luxury good that can be neglected in times of crisis?",
        "target_words": [
            {"word": "subventionieren", "translation": "to subsidize"},
            {"word": "kulturell", "translation": "cultural"},
            {"word": "Ausdrucksform", "translation": "form of expression"}
        ]
    },
    {
        "id": 409,
        "level": "C1",
        "theme": "Educational Equality",
        "question": "Hängt der Bildungserfolg in Deutschland zu stark von der sozialen Herkunft ab?",
        "question_en": "Does educational success in Germany depend too heavily on social background?",
        "target_words": [
            {"word": "Chancengleichheit", "translation": "equal opportunity"},
            {"word": "benachteiligen", "translation": "to disadvantage"},
            {"word": "Elite", "translation": "elite"}
        ]
    },
    {
        "id": 410,
        "level": "C1",
        "theme": "Surveillance vs. Security",
        "question": "Rechtfertigt die Terrorbekämpfung die massenhafte Überwachung von Bürgern?",
        "question_en": "Does fighting terrorism justify the mass surveillance of citizens?",
        "target_words": [
            {"word": "Privatsphäre", "translation": "privacy"},
            {"word": "Eingriff", "translation": "intervention"},
            {"word": "verhältnismäßig", "translation": "proportionate"}
        ]
    },
    {
        "id": 411,
        "level": "C1",
        "theme": "Migration & Integration",
        "question": "Was bedeutet 'gelungene Integration' für dich? Ist Assimilation notwendig?",
        "question_en": "What does 'successful integration' mean to you? Is assimilation necessary?",
        "target_words": [
            {"word": "Parallelgesellschaft", "translation": "parallel society"},
            {"word": "Teilhabe", "translation": "participation"},
            {"word": "Vielfalt", "translation": "diversity"}
        ]
    },
    {
        "id": 412,
        "level": "C1",
        "theme": "Space Exploration",
        "question": "Sollten Milliarden in die Raumfahrt investiert werden, solange wir Probleme auf der Erde haben?",
        "question_en": "Should billions be invested in space travel as long as we have problems on Earth?",
        "target_words": [
            {"word": "Ressourcen", "translation": "resources"},
            {"word": "rechtfertigen", "translation": "to justify"},
            {"word": "Forschung", "translation": "research"}
        ]
    },
    {
        "id": 413,
        "level": "C1",
        "theme": "Sustainable Economy",
        "question": "Ist ewiges Wirtschaftswachstum in einer Welt mit begrenzten Ressourcen möglich?",
        "question_en": "Is eternal economic growth possible in a world with limited resources?",
        "target_words": [
            {"word": "Nachhaltigkeit", "translation": "sustainability"},
            {"word": "Widerspruch", "translation": "contradiction"},
            {"word": "Konsumverhalten", "translation": "consumer behavior"}
        ]
    },
    {
        "id": 414,
        "level": "C1",
        "theme": "Gender Quotas",
        "question": "Sind Frauenquoten in Führungspositionen ein notwendiges Übel oder der falsche Weg?",
        "question_en": "Are gender quotas in leadership positions a necessary evil or the wrong path?",
        "target_words": [
            {"word": "Kompetenz", "translation": "competence"},
            {"word": "diskriminieren", "translation": "to discriminate"},
            {"word": "Gleichstellung", "translation": "equality"}
        ]
    },
    {
        "id": 415,
        "level": "C1",
        "theme": "Digital Detox & Mental Health",
        "question": "Welche psychologischen Langzeitfolgen hat die ständige digitale Erreichbarkeit?",
        "question_en": "What are the long-term psychological consequences of constant digital availability?",
        "target_words": [
            {"word": "Reizüberflutung", "translation": "sensory overload"},
            {"word": "Aufmerksamkeit", "translation": "attention"},
            {"word": "entschleunigen", "translation": "to slow down"}
        ]
    },
    {
        "id": 416,
        "level": "C1",
        "theme": "Scientific Skepticism",
        "question": "Warum verlieren viele Menschen das Vertrauen in die Wissenschaft und Fakten?",
        "question_en": "Why are many people losing trust in science and facts?",
        "target_words": [
            {"word": "Verschwörungstheorie", "translation": "conspiracy theory"},
            {"word": "Objektivität", "translation": "objectivity"},
            {"word": "Skepsis", "translation": "skepticism"}
        ]
    },
    {
        "id": 417,
        "level": "C1",
        "theme": "Prison System",
        "question": "Sollte der Strafvollzug eher auf Bestrafung oder auf Resozialisierung setzen?",
        "question_en": "Should the penal system focus more on punishment or on rehabilitation?",
        "target_words": [
            {"word": "Rückfallquote", "translation": "recidivism rate"},
            {"word": "Gesellschaft", "translation": "society"},
            {"word": "Sühne", "translation": "atonement"}
        ]
    },
    {
        "id": 418,
        "level": "C1",
        "theme": "Urban Mobility",
        "question": "Wie sieht die Stadt der Zukunft ohne private PKWs aus?",
        "question_en": "What does the city of the future look like without private cars?",
        "target_words": [
            {"word": "Infrastruktur", "translation": "infrastructure"},
            {"word": "Lebensqualität", "translation": "quality of life"},
            {"word": "Emissionen", "translation": "emissions"}
        ]
    },
    {
        "id": 419,
        "level": "C1",
        "theme": "Consumer Responsibility",
        "question": "Kann der einzelne Konsument die Welt retten oder braucht es politische Verbote?",
        "question_en": "Can the individual consumer save the world or are political bans needed?",
        "target_words": [
            {"word": "Einfluss", "translation": "influence"},
            {"word": "regulieren", "translation": "to regulate"},
            {"word": "Machtlosigkeit", "translation": "powerlessness"}
        ]
    },
    {
        "id": 420,
        "level": "C1",
        "theme": "Intergenerational Conflict",
        "question": "Werden die Ressourcen fair zwischen den Generationen verteilt (Rente, Klima)?",
        "question_en": "Are resources distributed fairly between generations (pension, climate)?",
        "target_words": [
            {"word": "Solidarität", "translation": "solidarity"},
            {"word": "Last", "translation": "burden"},
            {"word": "Gerechtigkeit", "translation": "justice"}
        ]
    },
    {
        "id": 421,
        "level": "C1",
        "theme": "Leadership Styles",
        "question": "Was zeichnet eine moderne Führungskraft aus: Autorität oder Empathie?",
        "question_en": "What characterizes a modern leader: authority or empathy?",
        "target_words": [
            {"word": "Hierarchie", "translation": "hierarchy"},
            {"word": "motivieren", "translation": "to motivate"},
            {"word": "auf Augenhöhe", "translation": "on equal footing"}
        ]
    },
    {
        "id": 422,
        "level": "C1",
        "theme": "Media Literacy",
        "question": "Sollte Medienkompetenz ein Pflichtfach an allen Schulen sein?",
        "question_en": "Should media literacy be a compulsory subject in all schools?",
        "target_words": [
            {"word": "analysieren", "translation": "to analyze"},
            {"word": "manipulativ", "translation": "manipulative"},
            {"word": "Lehrplan", "translation": "curriculum"}
        ]
    },
    {
        "id": 423,
        "level": "C1",
        "theme": "Alternative Medicine",
        "question": "Sollten Krankenkassen auch alternative Heilmethoden (z.B. Homöopathie) bezahlen?",
        "question_en": "Should health insurance companies also pay for alternative healing methods (e.g., homeopathy)?",
        "target_words": [
            {"word": "Wirksamkeit", "translation": "effectiveness"},
            {"word": "Placebo", "translation": "placebo"},
            {"word": "schulmedizinisch", "translation": "conventional medicine"}
        ]
    },
    {
        "id": 424,
        "level": "C1",
        "theme": "Patriotism vs. Nationalism",
        "question": "Ist Patriotismus in einer globalisierten Welt noch zeitgemäß?",
        "question_en": "Is patriotism still appropriate in a globalized world?",
        "target_words": [
            {"word": "Zugehörigkeit", "translation": "belonging"},
            {"word": "Grenze", "translation": "border"},
            {"word": "stolz", "translation": "proud"}
        ]
    },
    {
        "id": 425,
        "level": "C1",
        "theme": "Minimalism",
        "question": "Ist Minimalismus ein privilegierter Lifestyle oder eine Antwort auf den Kapitalismus?",
        "question_en": "Is minimalism a privileged lifestyle or an answer to capitalism?",
        "target_words": [
            {"word": "Überfluss", "translation": "excess"},
            {"word": "verzichten", "translation": "to renounce"},
            {"word": "Fokus", "translation": "focus"}
        ]
    }
]

C2_QUESTIONS = [
    {
        "id": 501,
        "level": "C2",
        "theme": "Linguistic Relativity",
        "question": "Inwiefern bestimmt die Struktur unserer Sprache die Art und Weise, wie wir die Welt wahrnehmen (Sapir-Whorf-Hypothese)?",
        "question_en": "To what extent does the structure of our language determine the way we perceive the world (Sapir-Whorf hypothesis)?",
        "target_words": [
            {"word": "kognitiv", "translation": "cognitive"},
            {"word": "Determinismus", "translation": "determinism"},
            {"word": "implizieren", "translation": "to imply"}
        ]
    },
    {
        "id": 502,
        "level": "C2",
        "theme": "The Crisis of Democracy",
        "question": "Erleben wir aktuell eine Erosion demokratischer Werte oder lediglich einen notwendigen Transformationsprozess?",
        "question_en": "Are we currently experiencing an erosion of democratic values or merely a necessary transformation process?",
        "target_words": [
            {"word": "Resilienz", "translation": "resilience"},
            {"word": "populistisch", "translation": "populist"},
            {"word": "polarisieren", "translation": "to polarize"}
        ]
    },
    {
        "id": 503,
        "level": "C2",
        "theme": "Philosophy of Artificial Intelligence",
        "question": "Wenn eine KI ein Bewusstsein entwickelt, müssen wir ihr dann Menschenrechte zugestehen?",
        "question_en": "If an AI develops consciousness, must we then grant it human rights?",
        "target_words": [
            {"word": "Empfindungsfähigkeit", "translation": "sentience"},
            {"word": "ethisch", "translation": "ethical"},
            {"word": "Subjektstatus", "translation": "subject status"}
        ]
    },
    {
        "id": 504,
        "level": "C2",
        "theme": "The Illusion of Meritocracy",
        "question": "Ist die Meritokratie (Leistungsgesellschaft) ein gerechtes Ideal oder ein Mythos, der Ungleichheit verschleiert?",
        "question_en": "Is meritocracy a just ideal or a myth that disguises inequality?",
        "target_words": [
            {"word": "Privileg", "translation": "privilege"},
            {"word": "Chancengerechtigkeit", "translation": "equal opportunity"},
            {"word": "reproduzieren", "translation": "to reproduce"}
        ]
    },
    {
        "id": 505,
        "level": "C2",
        "theme": "Degrowth Economics",
        "question": "Ist das Konzept der Postwachstumsökonomie eine realistische Alternative zum Kapitalismus oder eine Utopie?",
        "question_en": "Is the concept of degrowth economics a realistic alternative to capitalism or a utopia?",
        "target_words": [
            {"word": "Ressourcenknappheit", "translation": "resource scarcity"},
            {"word": "Wohlstand", "translation": "prosperity"},
            {"word": "Paradigmenwechsel", "translation": "paradigm shift"}
        ]
    },
    {
        "id": 506,
        "level": "C2",
        "theme": "Algorithmic Bias",
        "question": "Wie verhindern wir, dass Algorithmen menschliche Vorurteile und Diskriminierung automatisieren?",
        "question_en": "How do we prevent algorithms from automating human prejudice and discrimination?",
        "target_words": [
            {"word": "Voreingenommenheit", "translation": "bias"},
            {"word": "Transparenz", "translation": "transparency"},
            {"word": "diskret", "translation": "discrete"}
        ]
    },
    {
        "id": 507,
        "level": "C2",
        "theme": "Transhumanism",
        "question": "Sollte der Mensch durch Technologie seine biologischen Grenzen überwinden (Transhumanismus)?",
        "question_en": "Should humans overcome their biological limits through technology (transhumanism)?",
        "target_words": [
            {"word": "Evolution", "translation": "evolution"},
            {"word": "Optimierung", "translation": "optimization"},
            {"word": "Obsoleszenz", "translation": "obsolescence"}
        ]
    },
    {
        "id": 508,
        "level": "C2",
        "theme": "Truth in the Post-Factual Era",
        "question": "Hat der Begriff der 'objektiven Wahrheit' im Zeitalter von Deepfakes und Echokammern ausgedient?",
        "question_en": "Has the concept of 'objective truth' become obsolete in the age of deepfakes and echo chambers?",
        "target_words": [
            {"word": "Verifizierung", "translation": "verification"},
            {"word": "Desinformation", "translation": "disinformation"},
            {"word": "epistemisch", "translation": "epistemic"}
        ]
    },
    {
        "id": 509,
        "level": "C2",
        "theme": "Neocolonialism",
        "question": "Inwiefern setzen moderne Handelsstrukturen koloniale Abhängigkeitsverhältnisse fort?",
        "question_en": "To what extent do modern trade structures perpetuate colonial dependency relationships?",
        "target_words": [
            {"word": "Ausbeutung", "translation": "exploitation"},
            {"word": "Souveränität", "translation": "sovereignty"},
            {"word": "asymmetrisch", "translation": "asymmetric"}
        ]
    },
    {
        "id": 510,
        "level": "C2",
        "theme": "The Purpose of Art",
        "question": "Darf Kunst rein ästhetisch sein, oder hat sie die Pflicht, gesellschaftliche Missstände anzuprangern?",
        "question_en": "May art be purely aesthetic, or does it have the duty to denounce social grievances?",
        "target_words": [
            {"word": "autonom", "translation": "autonomous"},
            {"word": "Engagement", "translation": "commitment"},
            {"word": "diskursiv", "translation": "discursive"}
        ]
    },
    {
        "id": 511,
        "level": "C2",
        "theme": "Universal Jurisdiction",
        "question": "Sollten Diktatoren vor internationalen Gerichten belangt werden können, auch wenn sie die Souveränität ihres Landes beanspruchen?",
        "question_en": "Should dictators be liable before international courts, even if they claim their country's sovereignty?",
        "target_words": [
            {"word": "Immunität", "translation": "immunity"},
            {"word": "Völkerrecht", "translation": "international law"},
            {"word": "Präzedenzfall", "translation": "precedent"}
        ]
    },
    {
        "id": 512,
        "level": "C2",
        "theme": "Genetic Engineering (Designer Babies)",
        "question": "Führt die Möglichkeit, das Erbgut von Embryonen zu bearbeiten, zwangsläufig zu einer Zweiklassengesellschaft?",
        "question_en": "Does the ability to edit the genome of embryos inevitably lead to a two-tier society?",
        "target_words": [
            {"word": "Eugenik", "translation": "eugenics"},
            {"word": "Selektion", "translation": "selection"},
            {"word": "ethisch vertretbar", "translation": "ethically justifiable"}
        ]
    },
    {
        "id": 513,
        "level": "C2",
        "theme": "Urban Gentrification Nuances",
        "question": "Ist Gentrifizierung ein unvermeidbarer Nebeneffekt städtischer Entwicklung oder politisches Versagen?",
        "question_en": "Is gentrification an unavoidable side effect of urban development or political failure?",
        "target_words": [
            {"word": "Segregation", "translation": "segregation"},
            {"word": "Revitalisierung", "translation": "revitalization"},
            {"word": "sozioökonomisch", "translation": "socioeconomic"}
        ]
    },
    {
        "id": 514,
        "level": "C2",
        "theme": "Identity Politics",
        "question": "Fördert Identitätspolitik die Inklusion oder führt sie zur Fragmentierung der Gesellschaft?",
        "question_en": "Does identity politics promote inclusion or lead to the fragmentation of society?",
        "target_words": [
            {"word": "Partikularinteressen", "translation": "particular interests"},
            {"word": "marginalisiert", "translation": "marginalized"},
            {"word": "Solidarität", "translation": "solidarity"}
        ]
    },
    {
        "id": 515,
        "level": "C2",
        "theme": "Work and Meaning",
        "question": "Wie definieren wir den Sinn des Lebens in einer Welt, in der Erwerbsarbeit zunehmend automatisiert wird?",
        "question_en": "How do we define the meaning of life in a world where gainful employment is increasingly automated?",
        "target_words": [
            {"word": "Müßiggang", "translation": "idleness"},
            {"word": "Selbstverwirklichung", "translation": "self-actualization"},
            {"word": "Grundeinkommen", "translation": "basic income"}
        ]
    },
    {
        "id": 516,
        "level": "C2",
        "theme": "Privacy vs. Public Health",
        "question": "War die Einschränkung von Freiheitsrechten während der Pandemie verhältnismäßig?",
        "question_en": "Was the restriction of civil liberties during the pandemic proportionate?",
        "target_words": [
            {"word": "Grundrechte", "translation": "fundamental rights"},
            {"word": "Abwägung", "translation": "weighing/balancing"},
            {"word": "Prävention", "translation": "prevention"}
        ]
    },
    {
        "id": 517,
        "level": "C2",
        "theme": "Diplomacy vs. Conflict",
        "question": "Ist 'Soft Power' (kulturelle Attraktivität) heute wirkungsvoller als militärische Stärke?",
        "question_en": "Is 'soft power' (cultural attractiveness) more effective today than military strength?",
        "target_words": [
            {"word": "Diplomatie", "translation": "diplomacy"},
            {"word": "Einflusssphäre", "translation": "sphere of influence"},
            {"word": "sanktionieren", "translation": "to sanction"}
        ]
    },
    {
        "id": 518,
        "level": "C2",
        "theme": "Educational Philosophy",
        "question": "Sollte Bildung dem Humboldtschen Ideal der Persönlichkeitsbildung folgen oder rein arbeitsmarktorientiert sein?",
        "question_en": "Should education follow the Humboldtian ideal of character formation or be purely labor market oriented?",
        "target_words": [
            {"word": "utilitaristisch", "translation": "utilitarian"},
            {"word": "Bildungsideal", "translation": "educational ideal"},
            {"word": "Kompetenz", "translation": "competence"}
        ]
    },
    {
        "id": 519,
        "level": "C2",
        "theme": "Corporate Social Responsibility",
        "question": "Ist CSR (Corporate Social Responsibility) meistens nur 'Greenwashing' oder ein echter Wandel?",
        "question_en": "Is CSR mostly just 'greenwashing' or a real change?",
        "target_words": [
            {"word": "Imagepflege", "translation": "image cultivation"},
            {"word": "Glaubwürdigkeit", "translation": "credibility"},
            {"word": "Profitmaximierung", "translation": "profit maximization"}
        ]
    },
    {
        "id": 520,
        "level": "C2",
        "theme": "The Death of the Author",
        "question": "Sollte man das Werk eines Künstlers getrennt von seiner moralischen Verfehlung als Person betrachten?",
        "question_en": "Should one view an artist's work separately from their moral misconduct as a person?",
        "target_words": [
            {"word": "boykottieren", "translation": "to boycott"},
            {"word": "Rezeption", "translation": "reception"},
            {"word": "Differenzierung", "translation": "differentiation"}
        ]
    },
    {
        "id": 521,
        "level": "C2",
        "theme": "Surveillance Capitalism",
        "question": "Haben wir die Kontrolle über unsere persönlichen Daten im Zeitalter des Überwachungskapitalismus unwiderruflich verloren?",
        "question_en": "Have we irrevocably lost control over our personal data in the age of surveillance capitalism?",
        "target_words": [
            {"word": "Kommodifizierung", "translation": "commodification"},
            {"word": "Verhaltensvorhersage", "translation": "behavior prediction"},
            {"word": "Autonomie", "translation": "autonomy"}
        ]
    },
    {
        "id": 522,
        "level": "C2",
        "theme": "Cryptocurrencies",
        "question": "Stellen Kryptowährungen eine Demokratisierung des Finanzwesens dar oder ein spekulatives Risiko?",
        "question_en": "Do cryptocurrencies represent a democratization of finance or a speculative risk?",
        "target_words": [
            {"word": "dezentral", "translation": "decentralized"},
            {"word": "Volatilität", "translation": "volatility"},
            {"word": "Regulierung", "translation": "regulation"}
        ]
    },
    {
        "id": 523,
        "level": "C2",
        "theme": "Globalization of Culture",
        "question": "Führt die globale Dominanz der englischen Sprache zum Aussterben kleinerer Sprachen und Denkweisen?",
        "question_en": "Does the global dominance of the English language lead to the extinction of smaller languages and ways of thinking?",
        "target_words": [
            {"word": "Hegemonie", "translation": "hegemony"},
            {"word": "Sprachtod", "translation": "language death"},
            {"word": "kulturelles Erbe", "translation": "cultural heritage"}
        ]
    },
    {
        "id": 524,
        "level": "C2",
        "theme": "Utilitarianism vs. Deontology",
        "question": "Darf man wenige Menschen opfern, um viele zu retten? (Das Trolley-Problem im echten Leben)",
        "question_en": "May one sacrifice a few people to save many? (The trolley problem in real life)",
        "target_words": [
            {"word": "moralisch", "translation": "moral"},
            {"word": "quantifizieren", "translation": "to quantify"},
            {"word": "Prinzipienethik", "translation": "deontological ethics"}
        ]
    },
    {
        "id": 525,
        "level": "C2",
        "theme": "Historical Revisionism",
        "question": "Wie sollten Nationen mit den dunklen Kapiteln ihrer Geschichte umgehen: Verdrängen oder Aufarbeiten?",
        "question_en": "How should nations deal with the dark chapters of their history: repress or process?",
        "target_words": [
            {"word": "Erinnerungskultur", "translation": "culture of remembrance"},
            {"word": "kollektives Gedächtnis", "translation": "collective memory"},
            {"word": "Verantwortung", "translation": "responsibility"}
        ]
    }
]

# Combine all questions
SPEAKING_QUESTIONS = A1_QUESTIONS + A2_QUESTIONS + B1_QUESTIONS + B2_QUESTIONS + C1_QUESTIONS + C2_QUESTIONS


async def upload_questions():
    """Upload speaking questions to MongoDB."""
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
    
    collection = db["speaking_questions"]
    
    # Check existing questions
    existing_count = await collection.count_documents({})
    print(f"Found {existing_count} existing questions in the database.")
    
    if existing_count > 0:
        # Ask for confirmation to replace
        response = input("Do you want to replace existing questions? (y/N): ").strip().lower()
        if response == 'y':
            result = await collection.delete_many({})
            print(f"Deleted {result.deleted_count} existing questions.")
        else:
            print("Keeping existing questions. Will insert new ones that don't exist.")
    
    # Insert questions
    inserted_count = 0
    updated_count = 0
    
    for question in SPEAKING_QUESTIONS:
        # Use upsert to avoid duplicates
        result = await collection.update_one(
            {"id": question["id"]},
            {"$set": question},
            upsert=True
        )
        if result.upserted_id:
            inserted_count += 1
        elif result.modified_count > 0:
            updated_count += 1
    
    print(f"\nUpload complete!")
    print(f"  - Inserted: {inserted_count} new questions")
    print(f"  - Updated: {updated_count} existing questions")
    
    # Verify
    final_count = await collection.count_documents({})
    print(f"  - Total questions in database: {final_count}")
    
    # Create indexes for efficient queries
    await collection.create_index("id", unique=True)
    await collection.create_index("theme")
    await collection.create_index("level")
    await collection.create_index([("level", 1), ("theme", 1)])
    print("  - Created indexes on 'id' (unique), 'theme', 'level', and compound (level, theme)")
    
    # List levels and themes
    levels = await collection.distinct("level")
    cefr_order = ["A1", "A2", "B1", "B2", "C1", "C2"]
    levels = [l for l in cefr_order if l in levels]
    
    print(f"\nAvailable levels and themes:")
    for level in levels:
        level_count = await collection.count_documents({"level": level})
        print(f"\n  {level} ({level_count} questions):")
        themes = await collection.distinct("theme", {"level": level})
        for theme in sorted(themes):
            count = await collection.count_documents({"level": level, "theme": theme})
            print(f"    - {theme}: {count} question(s)")
    
    client.close()
    print("\nDone!")


if __name__ == "__main__":
    asyncio.run(upload_questions())
