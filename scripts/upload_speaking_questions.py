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
A1_QUESTIONS = [
    {
        "id": 1,
        "level": "A1",
        "theme": "Introduction",
        "question": "Wie heißt du und woher kommst du?",
        "question_en": "What is your name and where do you come from?",
        "target_words": ["Name", "kommen", "Land"]
    },
    {
        "id": 2,
        "level": "A1",
        "theme": "Hobbies",
        "question": "Was machst du gern in deiner Freizeit?",
        "question_en": "What do you like to do in your free time?",
        "target_words": ["Sport", "lesen", "Musik"]
    },
    {
        "id": 3,
        "level": "A1",
        "theme": "Family",
        "question": "Erzähl mir von deiner Familie.",
        "question_en": "Tell me about your family.",
        "target_words": ["Bruder", "Schwester", "Eltern"]
    },
    {
        "id": 4,
        "level": "A1",
        "theme": "Food & Drink",
        "question": "Was isst du gern zum Frühstück?",
        "question_en": "What do you like to eat for breakfast?",
        "target_words": ["Brot", "Kaffee", "Ei"]
    },
    {
        "id": 5,
        "level": "A1",
        "theme": "Work",
        "question": "Was bist du von Beruf?",
        "question_en": "What is your job?",
        "target_words": ["arbeiten", "Büro", "Kollege"]
    },
    {
        "id": 6,
        "level": "A1",
        "theme": "Shopping",
        "question": "Was möchtest du im Supermarkt kaufen?",
        "question_en": "What would you like to buy at the supermarket?",
        "target_words": ["Milch", "teuer", "Euro"]
    },
    {
        "id": 7,
        "level": "A1",
        "theme": "Daily Routine",
        "question": "Wann stehst du morgens auf?",
        "question_en": "When do you get up in the morning?",
        "target_words": ["Uhr", "früh", "morgen"]
    },
    {
        "id": 8,
        "level": "A1",
        "theme": "Weekend",
        "question": "Was machst du am Wochenende?",
        "question_en": "What do you do on the weekend?",
        "target_words": ["Samstag", "Freunde", "schlafen"]
    },
    {
        "id": 9,
        "level": "A1",
        "theme": "Home",
        "question": "Wie ist deine Wohnung?",
        "question_en": "What is your apartment like?",
        "target_words": ["groß", "Zimmer", "Küche"]
    },
    {
        "id": 10,
        "level": "A1",
        "theme": "Weather",
        "question": "Wie ist das Wetter heute?",
        "question_en": "How is the weather today?",
        "target_words": ["Sonne", "kalt", "regnen"]
    },
    {
        "id": 11,
        "level": "A1",
        "theme": "Transport",
        "question": "Wie fährst du zur Arbeit oder zur Schule?",
        "question_en": "How do you go to work or school?",
        "target_words": ["Bus", "Auto", "Zug"]
    },
    {
        "id": 12,
        "level": "A1",
        "theme": "Restaurant",
        "question": "Was möchten Sie bestellen?",
        "question_en": "What would you like to order?",
        "target_words": ["Wasser", "Fleisch", "Rechnung"]
    },
    {
        "id": 13,
        "level": "A1",
        "theme": "Clothing",
        "question": "Was trägst du heute?",
        "question_en": "What are you wearing today?",
        "target_words": ["Hose", "blau", "T-Shirt"]
    },
    {
        "id": 14,
        "level": "A1",
        "theme": "Language Learning",
        "question": "Warum lernst du Deutsch?",
        "question_en": "Why are you learning German?",
        "target_words": ["Sprache", "verstehen", "lernen"]
    },
    {
        "id": 15,
        "level": "A1",
        "theme": "Travel",
        "question": "Wohin reist du gern im Urlaub?",
        "question_en": "Where do you like to travel on vacation?",
        "target_words": ["Meer", "Strand", "Flugzeug"]
    },
    {
        "id": 16,
        "level": "A1",
        "theme": "City",
        "question": "Was gibt es in deiner Stadt?",
        "question_en": "What is there in your city?",
        "target_words": ["Park", "Bahnhof", "Kino"]
    },
    {
        "id": 17,
        "level": "A1",
        "theme": "Health",
        "question": "Wie geht es dir heute?",
        "question_en": "How are you today?",
        "target_words": ["gut", "müde", "Kopfschmerzen"]
    },
    {
        "id": 18,
        "level": "A1",
        "theme": "Furniture",
        "question": "Was hast du in deinem Wohnzimmer?",
        "question_en": "What do you have in your living room?",
        "target_words": ["Tisch", "Sofa", "Fernseher"]
    },
    {
        "id": 19,
        "level": "A1",
        "theme": "Birthday",
        "question": "Wann hast du Geburtstag?",
        "question_en": "When is your birthday?",
        "target_words": ["Jahr", "Party", "Geschenk"]
    },
    {
        "id": 20,
        "level": "A1",
        "theme": "Pets",
        "question": "Hast du ein Haustier?",
        "question_en": "Do you have a pet?",
        "target_words": ["Hund", "Katze", "lieb"]
    },
    {
        "id": 21,
        "level": "A1",
        "theme": "Evening",
        "question": "Was machst du am Abend?",
        "question_en": "What do you do in the evening?",
        "target_words": ["fernsehen", "Buch", "essen"]
    },
    {
        "id": 22,
        "level": "A1",
        "theme": "Directions",
        "question": "Wo ist die Toilette, bitte?",
        "question_en": "Where is the toilet, please?",
        "target_words": ["links", "rechts", "geradeaus"]
    },
    {
        "id": 23,
        "level": "A1",
        "theme": "Colors",
        "question": "Was ist deine Lieblingsfarbe?",
        "question_en": "What is your favorite color?",
        "target_words": ["rot", "grün", "schwarz"]
    },
    {
        "id": 24,
        "level": "A1",
        "theme": "Appointments",
        "question": "Hast du am Montag Zeit?",
        "question_en": "Do you have time on Monday?",
        "target_words": ["Termin", "Woche", "treffen"]
    },
    {
        "id": 25,
        "level": "A1",
        "theme": "Restaurant Payment",
        "question": "Möchten Sie bar oder mit Karte zahlen?",
        "question_en": "Would you like to pay cash or by card?",
        "target_words": ["Karte", "bezahlen", "bitte"]
    }
]

A2_QUESTIONS = [
    {
        "id": 101,
        "level": "A2",
        "theme": "Last Vacation (Past Tense)",
        "question": "Wo warst du in deinem letzten Urlaub und was hast du gemacht?",
        "question_en": "Where were you on your last vacation and what did you do?",
        "target_words": ["gereist", "Meer", "besichtigt"]
    },
    {
        "id": 102,
        "level": "A2",
        "theme": "Weekend Activities (Past Tense)",
        "question": "Was hast du am letzten Wochenende gemacht?",
        "question_en": "What did you do last weekend?",
        "target_words": ["Freunde", "getroffen", "ausgegangen"]
    },
    {
        "id": 103,
        "level": "A2",
        "theme": "Shopping for Clothes",
        "question": "Du möchtest eine Jacke kaufen. Was sagst du zum Verkäufer?",
        "question_en": "You want to buy a jacket. What do you say to the salesperson?",
        "target_words": ["Größe", "anprobieren", "passen"]
    },
    {
        "id": 104,
        "level": "A2",
        "theme": "Health & Sickness",
        "question": "Du bist krank und rufst deinen Chef an. Was sagst du?",
        "question_en": "You are sick and calling your boss. What do you say?",
        "target_words": ["Fieber", "Arzt", "heute"]
    },
    {
        "id": 105,
        "level": "A2",
        "theme": "Future Plans",
        "question": "Was sind deine Pläne für den nächsten Sommer?",
        "question_en": "What are your plans for next summer?",
        "target_words": ["werden", "reisen", "besuchen"]
    },
    {
        "id": 106,
        "level": "A2",
        "theme": "Restaurant Complaint",
        "question": "Das Essen im Restaurant ist kalt. Was sagst du zum Kellner?",
        "question_en": "The food in the restaurant is cold. What do you say to the waiter?",
        "target_words": ["Entschuldigung", "kalt", "zurückgeben"]
    },
    {
        "id": 107,
        "level": "A2",
        "theme": "Daily Routine (Reflexive)",
        "question": "Wie sieht ein normaler Arbeitstag bei dir aus?",
        "question_en": "What does a normal workday look like for you?",
        "target_words": ["aufstehen", "duschen", "Büro"]
    },
    {
        "id": 108,
        "level": "A2",
        "theme": "Directions",
        "question": "Ein Tourist fragt nach dem Weg zum Bahnhof. Wie hilfst du ihm?",
        "question_en": "A tourist asks for the way to the train station. How do you help him?",
        "target_words": ["abbiegen", "Ampel", "geradeaus"]
    },
    {
        "id": 109,
        "level": "A2",
        "theme": "Invitations",
        "question": "Du möchtest deinen Freund ins Kino einladen. Was fragst du ihn?",
        "question_en": "You want to invite your friend to the cinema. What do you ask him?",
        "target_words": ["Lust", "Zeit", "Film"]
    },
    {
        "id": 110,
        "level": "A2",
        "theme": "Moving House",
        "question": "Beschreibe deine Traumwohnung.",
        "question_en": "Describe your dream apartment.",
        "target_words": ["Balkon", "hell", "Zentrum"]
    },
    {
        "id": 111,
        "level": "A2",
        "theme": "Education/School",
        "question": "Welches Fach hast du in der Schule gemocht und warum?",
        "question_en": "Which subject did you like in school and why?",
        "target_words": ["Mathe", "interessant", "Lehrer"]
    },
    {
        "id": 112,
        "level": "A2",
        "theme": "Technology",
        "question": "Wie oft benutzt du dein Handy und wofür?",
        "question_en": "How often do you use your cell phone and for what?",
        "target_words": ["Nachrichten", "Internet", "schicken"]
    },
    {
        "id": 113,
        "level": "A2",
        "theme": "Gifts",
        "question": "Deine Mutter hat Geburtstag. Was schenkst du ihr?",
        "question_en": "It is your mother's birthday. What do you give her?",
        "target_words": ["Blumen", "Parfüm", "Idee"]
    },
    {
        "id": 114,
        "level": "A2",
        "theme": "Public Transport",
        "question": "Der Zug hat Verspätung. Du sprichst mit einem anderen Fahrgast.",
        "question_en": "The train is delayed. You speak to another passenger.",
        "target_words": ["warten", "Minuten", "Anschluss"]
    },
    {
        "id": 115,
        "level": "A2",
        "theme": "Comparison",
        "question": "Wohnst du lieber in der Stadt oder auf dem Land? Warum?",
        "question_en": "Do you prefer living in the city or in the country? Why?",
        "target_words": ["laut", "ruhig", "besser"]
    },
    {
        "id": 116,
        "level": "A2",
        "theme": "Cooking",
        "question": "Was ist dein Lieblingsgericht und kannst du es kochen?",
        "question_en": "What is your favorite dish and can you cook it?",
        "target_words": ["Rezept", "Zutaten", "lecker"]
    }
]

B1_QUESTIONS = [
    {
        "id": 201,
        "level": "B1",
        "theme": "Social Media",
        "question": "Was sind die Vor- und Nachteile von sozialen Medien deiner Meinung nach?",
        "question_en": "In your opinion, what are the advantages and disadvantages of social media?",
        "target_words": ["Vorteil", "Nachteil", "kommunizieren"]
    },
    {
        "id": 202,
        "level": "B1",
        "theme": "Environment",
        "question": "Was machst du persönlich für den Umweltschutz?",
        "question_en": "What do you personally do for environmental protection?",
        "target_words": ["Müll trennen", "Umwelt", "vermeiden"]
    },
    {
        "id": 203,
        "level": "B1",
        "theme": "Work-Life Balance",
        "question": "Was ist wichtiger: Ein hohes Gehalt oder nette Kollegen? Begründe deine Meinung.",
        "question_en": "What is more important: A high salary or nice colleagues? Justify your opinion.",
        "target_words": ["Gehalt", "Betriebsklima", "zufrieden"]
    },
    {
        "id": 204,
        "level": "B1",
        "theme": "Healthy Lifestyle",
        "question": "Was bedeutet für dich ein gesundes Leben?",
        "question_en": "What does a healthy life mean to you?",
        "target_words": ["Ernährung", "bewegen", "Stress"]
    },
    {
        "id": 205,
        "level": "B1",
        "theme": "Travel Experiences",
        "question": "Erzähl von einer Reise, die du nie vergessen wirst. Was ist passiert?",
        "question_en": "Tell about a trip you will never forget. What happened?",
        "target_words": ["Erlebnis", "überrascht", "Kultur"]
    },
    {
        "id": 206,
        "level": "B1",
        "theme": "Online Shopping",
        "question": "Kaufst du lieber im Internet oder im Geschäft ein? Warum?",
        "question_en": "Do you prefer shopping on the internet or in a store? Why?",
        "target_words": ["bestellen", "anprobieren", "Auswahl"]
    },
    {
        "id": 207,
        "level": "B1",
        "theme": "Public Transport vs Car",
        "question": "Sollte man in der Innenstadt das Autofahren verbieten?",
        "question_en": "Should driving be banned in the city center?",
        "target_words": ["Verkehrsmittel", "Stau", "Luftverschmutzung"]
    },
    {
        "id": 208,
        "level": "B1",
        "theme": "Future Plans",
        "question": "Wo siehst du dich beruflich in fünf Jahren?",
        "question_en": "Where do you see yourself professionally in five years?",
        "target_words": ["Karriere", "Fortbildung", "erreichen"]
    },
    {
        "id": 209,
        "level": "B1",
        "theme": "Learning Languages",
        "question": "Was findest du am schwierigsten beim Deutschlernen?",
        "question_en": "What do you find most difficult about learning German?",
        "target_words": ["Grammatik", "Aussprache", "üben"]
    },
    {
        "id": 210,
        "level": "B1",
        "theme": "Friendship",
        "question": "Was macht einen guten Freund oder eine gute Freundin aus?",
        "question_en": "What makes a good friend?",
        "target_words": ["vertrauen", "zuverlässig", "helfen"]
    },
    {
        "id": 211,
        "level": "B1",
        "theme": "Housing",
        "question": "Würdest du lieber in einer kleinen Wohnung im Zentrum oder in einem großen Haus auf dem Land wohnen?",
        "question_en": "Would you rather live in a small apartment in the center or a large house in the country?",
        "target_words": ["Miete", "Lage", "Nachbarn"]
    },
    {
        "id": 212,
        "level": "B1",
        "theme": "Complaint (Service)",
        "question": "Du hast ein kaputtes Produkt erhalten. Beschwere dich beim Kundenservice.",
        "question_en": "You received a broken product. Complain to customer service.",
        "target_words": ["beschädigt", "umtauschen", "Geld zurück"]
    },
    {
        "id": 213,
        "level": "B1",
        "theme": "Movies & Series",
        "question": "Welchen Film hast du zuletzt gesehen und worum ging es?",
        "question_en": "Which movie did you watch last and what was it about?",
        "target_words": ["Handlung", "Schauspieler", "spannend"]
    },
    {
        "id": 214,
        "level": "B1",
        "theme": "Festivals & Traditions",
        "question": "Welches Fest ist in deinem Heimatland besonders wichtig und wie feiert man es?",
        "question_en": "Which festival is particularly important in your home country and how is it celebrated?",
        "target_words": ["Tradition", "feiern", "Familie"]
    },
    {
        "id": 215,
        "level": "B1",
        "theme": "Technology in Daily Life",
        "question": "Könntest du eine Woche ohne Internet leben?",
        "question_en": "Could you live a week without the internet?",
        "target_words": ["abhängig", "Smartphone", "Informationen"]
    },
    {
        "id": 216,
        "level": "B1",
        "theme": "Eating Habits",
        "question": "Wie hat sich deine Ernährung in den letzten Jahren verändert?",
        "question_en": "How has your diet changed in the last few years?",
        "target_words": ["vegetarisch", "kochen", "Gesundheit"]
    },
    {
        "id": 217,
        "level": "B1",
        "theme": "Advice to a Friend",
        "question": "Dein Freund hat Liebeskummer. Welchen Rat gibst du ihm?",
        "question_en": "Your friend is lovesick. What advice do you give him?",
        "target_words": ["vorschlagen", "ablenken", "reden"]
    },
    {
        "id": 218,
        "level": "B1",
        "theme": "Job Interview (Strengths)",
        "question": "Was sind deine größten Stärken und Schwächen?",
        "question_en": "What are your greatest strengths and weaknesses?",
        "target_words": ["organisiert", "Geduld", "Teamfähigkeit"]
    },
    {
        "id": 219,
        "level": "B1",
        "theme": "School System",
        "question": "Was würdest du am Schulsystem ändern, wenn du könntest?",
        "question_en": "What would you change about the school system if you could?",
        "target_words": ["Unterricht", "Noten", "verbessern"]
    },
    {
        "id": 220,
        "level": "B1",
        "theme": "Volunteering",
        "question": "Hältst du ehrenamtliche Arbeit für wichtig?",
        "question_en": "Do you consider volunteer work important?",
        "target_words": ["Gesellschaft", "unterstützen", "Erfahrung"]
    },
    {
        "id": 221,
        "level": "B1",
        "theme": "News & Media",
        "question": "Wie informierst du dich über aktuelle Nachrichten?",
        "question_en": "How do you inform yourself about current news?",
        "target_words": ["Zeitung", "Online", "glauben"]
    },
    {
        "id": 222,
        "level": "B1",
        "theme": "Stress Management",
        "question": "Was machst du, wenn du viel Stress hast?",
        "question_en": "What do you do when you have a lot of stress?",
        "target_words": ["entspannen", "Ruhe", "ausgleichen"]
    },
    {
        "id": 223,
        "level": "B1",
        "theme": "Fashion & Clothing",
        "question": "Ist dir Mode wichtig oder ist Kleidung nur praktisch für dich?",
        "question_en": "Is fashion important to you or is clothing just practical for you?",
        "target_words": ["Stil", "Marken", "tragen"]
    },
    {
        "id": 224,
        "level": "B1",
        "theme": "Childhood Memories",
        "question": "Was war dein liebstes Spielzeug als Kind?",
        "question_en": "What was your favorite toy as a child?",
        "target_words": ["erinnern", "spielen", "damals"]
    },
    {
        "id": 225,
        "level": "B1",
        "theme": "Cultural Differences",
        "question": "Was ist der größte Unterschied zwischen Deutschland und deinem Heimatland?",
        "question_en": "What is the biggest difference between Germany and your home country?",
        "target_words": ["Mentalität", "Pünktlichkeit", "anders"]
    }
]

B2_QUESTIONS = [
    {
        "id": 301,
        "level": "B2",
        "theme": "Remote Work / Home Office",
        "question": "Ist das Arbeiten im Homeoffice ein Modell für die Zukunft? Nenne Vor- und Nachteile.",
        "question_en": "Is working from home a model for the future? Name advantages and disadvantages.",
        "target_words": ["Effizienz", "pendeln", "Trennung"]
    },
    {
        "id": 302,
        "level": "B2",
        "theme": "Artificial Intelligence",
        "question": "Wird künstliche Intelligenz in Zukunft viele Arbeitsplätze ersetzen?",
        "question_en": "Will artificial intelligence replace many jobs in the future?",
        "target_words": ["ersetzen", "Fortschritt", "Bedrohung"]
    },
    {
        "id": 303,
        "level": "B2",
        "theme": "Climate Change Responsibility",
        "question": "Wer trägt mehr Verantwortung für den Klimaschutz: Der Einzelne oder die Regierung?",
        "question_en": "Who bears more responsibility for climate protection: The individual or the government?",
        "target_words": ["Maßnahmen", "Verantwortung", "Nachhaltigkeit"]
    },
    {
        "id": 304,
        "level": "B2",
        "theme": "Globalization",
        "question": "Welche Auswirkungen hat die Globalisierung auf die lokale Kultur?",
        "question_en": "What effects does globalization have on local culture?",
        "target_words": ["Einfluss", "Vielfalt", "bewahren"]
    },
    {
        "id": 305,
        "level": "B2",
        "theme": "Education vs. Experience",
        "question": "Was ist wichtiger für die Karriere: Ein Universitätsabschluss oder praktische Erfahrung?",
        "question_en": "What is more important for a career: A university degree or practical experience?",
        "target_words": ["Fachwissen", "Voraussetzung", "Kompetenz"]
    },
    {
        "id": 306,
        "level": "B2",
        "theme": "Data Privacy",
        "question": "Sind wir bereit, unsere Privatsphäre für mehr Sicherheit oder Komfort aufzugeben?",
        "question_en": "Are we willing to give up our privacy for more security or convenience?",
        "target_words": ["Datenschutz", "überwachen", "transparent"]
    },
    {
        "id": 307,
        "level": "B2",
        "theme": "Consumerism",
        "question": "Leben wir in einer Wegwerfgesellschaft? Sollten wir unser Konsumverhalten ändern?",
        "question_en": "Do we live in a throwaway society? Should we change our consumer behavior?",
        "target_words": ["Konsum", "reparieren", "Qualität"]
    },
    {
        "id": 308,
        "level": "B2",
        "theme": "Urbanization",
        "question": "Was sind die größten Herausforderungen für Großstädte in den nächsten 20 Jahren?",
        "question_en": "What are the biggest challenges for big cities in the next 20 years?",
        "target_words": ["Infrastruktur", "Mietpreise", "Bevölkerungswachstum"]
    },
    {
        "id": 309,
        "level": "B2",
        "theme": "Mental Health",
        "question": "Warum wird das Thema psychische Gesundheit am Arbeitsplatz immer wichtiger?",
        "question_en": "Why is the topic of mental health in the workplace becoming increasingly important?",
        "target_words": ["Leistungsdruck", "Burnout", "Wohlbefinden"]
    },
    {
        "id": 310,
        "level": "B2",
        "theme": "Gender Equality",
        "question": "Ist die Gleichberechtigung von Männern und Frauen in der Gesellschaft bereits erreicht?",
        "question_en": "Has gender equality been achieved in society yet?",
        "target_words": ["Chancengleichheit", "Gehalt", "diskriminieren"]
    },
    {
        "id": 311,
        "level": "B2",
        "theme": "Mass Tourism",
        "question": "Schadet der Massentourismus den Urlaubsorten mehr, als er nutzt?",
        "question_en": "Does mass tourism harm vacation spots more than it benefits them?",
        "target_words": ["Umweltbelastung", "Profitieren", "Einschränkung"]
    },
    {
        "id": 312,
        "level": "B2",
        "theme": "Fake News & Media",
        "question": "Wie kann man erkennen, ob eine Nachricht wahr oder gefälscht ist?",
        "question_en": "How can one recognize if a news story is true or fake?",
        "target_words": ["Quelle", "kritisch", "verbreiten"]
    },
    {
        "id": 313,
        "level": "B2",
        "theme": "Hypothetical Politics",
        "question": "Wenn du Bundeskanzler wärst, welches Gesetz würdest du sofort einführen?",
        "question_en": "If you were Chancellor, which law would you introduce immediately?",
        "target_words": ["ändern", "Regierung", "Priorität"]
    },
    {
        "id": 314,
        "level": "B2",
        "theme": "Language & Culture",
        "question": "Verliert man seine kulturelle Identität, wenn man in einem anderen Land lebt?",
        "question_en": "Do you lose your cultural identity when you live in another country?",
        "target_words": ["Integration", "Wurzeln", "anpassen"]
    },
    {
        "id": 315,
        "level": "B2",
        "theme": "Volunteer Work (Compulsory)",
        "question": "Sollte ein soziales Jahr für junge Menschen nach der Schule verpflichtend sein?",
        "question_en": "Should a social gap year be mandatory for young people after school?",
        "target_words": ["Gemeinschaft", "Pflicht", "Reife"]
    },
    {
        "id": 316,
        "level": "B2",
        "theme": "Cash vs. Digital Payment",
        "question": "Sollte Bargeld in Zukunft komplett abgeschafft werden?",
        "question_en": "Should cash be completely abolished in the future?",
        "target_words": ["Zahlungsmittel", "Kontrolle", "bequem"]
    },
    {
        "id": 317,
        "level": "B2",
        "theme": "Genetic Engineering",
        "question": "Ist Gentechnik in der Landwirtschaft eine Lösung für den Welthunger oder ein Risiko?",
        "question_en": "Is genetic engineering in agriculture a solution for world hunger or a risk?",
        "target_words": ["modifiziert", "Ernährung", "unabsehbar"]
    },
    {
        "id": 318,
        "level": "B2",
        "theme": "Success Definition",
        "question": "Wie definierst du persönlichen Erfolg? Ist er nur materiell messbar?",
        "question_en": "How do you define personal success? Is it only measurably materially?",
        "target_words": ["Zufriedenheit", "Status", "erreichen"]
    },
    {
        "id": 319,
        "level": "B2",
        "theme": "Aging Society",
        "question": "Welche Probleme entstehen durch den demografischen Wandel?",
        "question_en": "What problems arise from demographic change?",
        "target_words": ["Rente", "Pflegekräfte", "Generationenvertrag"]
    },
    {
        "id": 320,
        "level": "B2",
        "theme": "Learning Methods",
        "question": "Kann man eine Fremdsprache nur mit Apps wirklich fließend lernen?",
        "question_en": "Can one really learn a foreign language fluently using only apps?",
        "target_words": ["Interaktion", "Disziplin", "ergänzen"]
    },
    {
        "id": 321,
        "level": "B2",
        "theme": "Advertising Influence",
        "question": "Inwieweit beeinflusst Werbung unser Kaufverhalten?",
        "question_en": "To what extent does advertising influence our buying behavior?",
        "target_words": ["manipulieren", "Marke", "Unterbewusstsein"]
    },
    {
        "id": 322,
        "level": "B2",
        "theme": "Nuclear Power",
        "question": "Ist Atomkraft eine notwendige Brückentechnologie oder zu gefährlich?",
        "question_en": "Is nuclear power a necessary bridging technology or too dangerous?",
        "target_words": ["Energieversorgung", "Atommüll", "Risiko"]
    },
    {
        "id": 323,
        "level": "B2",
        "theme": "Art and Vandalism",
        "question": "Ist Graffiti Kunst oder Sachbeschädigung?",
        "question_en": "Is graffiti art or property damage?",
        "target_words": ["Ausdrucksform", "illegal", "Stadtbild"]
    },
    {
        "id": 324,
        "level": "B2",
        "theme": "Universal Basic Income",
        "question": "Was hältst du von der Idee eines bedingungslosen Grundeinkommens?",
        "question_en": "What do you think of the idea of a universal basic income?",
        "target_words": ["Finanzierung", "Motivation", "Existenzminimum"]
    },
    {
        "id": 325,
        "level": "B2",
        "theme": "Friendship vs. Networking",
        "question": "Ist 'Networking' nur eine moderne Form der Freundschaft oder reines Geschäft?",
        "question_en": "Is 'networking' just a modern form of friendship or purely business?",
        "target_words": ["Beziehung", "Nutzen", "oberflächlich"]
    }
]

C1_QUESTIONS = [
    {
        "id": 401,
        "level": "C1",
        "theme": "Censorship & Free Speech",
        "question": "Wo endet die Meinungsfreiheit und wo beginnt Hate Speech? Nimm Stellung zur 'Cancel Culture'.",
        "question_en": "Where does freedom of speech end and hate speech begin? Take a stand on 'cancel culture'.",
        "target_words": ["Zensur", "Diskurs", "Konsequenz"]
    },
    {
        "id": 402,
        "level": "C1",
        "theme": "Bioethics (Gene Editing)",
        "question": "Ist es ethisch vertretbar, das Erbgut von Menschen zu verändern, um Krankheiten zu heilen?",
        "question_en": "Is it ethically justifiable to alter human genetics to cure diseases?",
        "target_words": ["Eingriff", "kontrovers", "unabsehbar"]
    },
    {
        "id": 403,
        "level": "C1",
        "theme": "Gentrification",
        "question": "Wie verändert die Gentrifizierung das soziale Gefüge einer Stadt?",
        "question_en": "How does gentrification change the social fabric of a city?",
        "target_words": ["Verdrängung", "Aufwertung", "Wohnraum"]
    },
    {
        "id": 404,
        "level": "C1",
        "theme": "Work Ethic & 4-Day Week",
        "question": "Führt eine Verkürzung der Arbeitszeit zu mehr Produktivität oder zu Wohlstandsverlust?",
        "question_en": "Does reducing working hours lead to more productivity or a loss of prosperity?",
        "target_words": ["Effizienz", "Auswirkung", "umsetzen"]
    },
    {
        "id": 405,
        "level": "C1",
        "theme": "Artificial Intelligence & Ethics",
        "question": "Sollten wir KI-Systemen moralische Entscheidungen überlassen (z.B. beim autonomen Fahren)?",
        "question_en": "Should we leave moral decisions to AI systems (e.g., in autonomous driving)?",
        "target_words": ["Dilemma", "Verantwortung", "programmieren"]
    },
    {
        "id": 406,
        "level": "C1",
        "theme": "Language Evolution",
        "question": "Verdirbt die Jugendsprache oder der Einfluss des Englischen die deutsche Sprache?",
        "question_en": "Does youth slang or the influence of English spoil the German language?",
        "target_words": ["Sprachwandel", "bereichern", "verfallen"]
    },
    {
        "id": 407,
        "level": "C1",
        "theme": "Globalization vs. Localization",
        "question": "Führt die Globalisierung zu einer kulturellen Einheitsbrei oder fördert sie den Austausch?",
        "question_en": "Does globalization lead to cultural uniformity or does it promote exchange?",
        "target_words": ["Homogenisierung", "Identität", "bewahren"]
    },
    {
        "id": 408,
        "level": "C1",
        "theme": "The Role of Arts",
        "question": "Ist Kunst systemrelevant oder ein Luxusgut, das man in Krisenzeiten vernachlässigen kann?",
        "question_en": "Is art systematically relevant or a luxury good that can be neglected in times of crisis?",
        "target_words": ["subventionieren", "kulturell", "Ausdrucksform"]
    },
    {
        "id": 409,
        "level": "C1",
        "theme": "Educational Equality",
        "question": "Hängt der Bildungserfolg in Deutschland zu stark von der sozialen Herkunft ab?",
        "question_en": "Does educational success in Germany depend too heavily on social background?",
        "target_words": ["Chancengleichheit", "benachteiligen", "Elite"]
    },
    {
        "id": 410,
        "level": "C1",
        "theme": "Surveillance vs. Security",
        "question": "Rechtfertigt die Terrorbekämpfung die massenhafte Überwachung von Bürgern?",
        "question_en": "Does fighting terrorism justify the mass surveillance of citizens?",
        "target_words": ["Privatsphäre", "Eingriff", "verhältnismäßig"]
    },
    {
        "id": 411,
        "level": "C1",
        "theme": "Migration & Integration",
        "question": "Was bedeutet 'gelungene Integration' für dich? Ist Assimilation notwendig?",
        "question_en": "What does 'successful integration' mean to you? Is assimilation necessary?",
        "target_words": ["Parallelgesellschaft", "Teilhabe", "Vielfalt"]
    },
    {
        "id": 412,
        "level": "C1",
        "theme": "Space Exploration",
        "question": "Sollten Milliarden in die Raumfahrt investiert werden, solange wir Probleme auf der Erde haben?",
        "question_en": "Should billions be invested in space travel as long as we have problems on Earth?",
        "target_words": ["Ressourcen", "rechtfertigen", "Forschung"]
    },
    {
        "id": 413,
        "level": "C1",
        "theme": "Sustainable Economy",
        "question": "Ist ewiges Wirtschaftswachstum in einer Welt mit begrenzten Ressourcen möglich?",
        "question_en": "Is eternal economic growth possible in a world with limited resources?",
        "target_words": ["Nachhaltigkeit", "Widerspruch", "Konsumverhalten"]
    },
    {
        "id": 414,
        "level": "C1",
        "theme": "Gender Quotas",
        "question": "Sind Frauenquoten in Führungspositionen ein notwendiges Übel oder der falsche Weg?",
        "question_en": "Are gender quotas in leadership positions a necessary evil or the wrong path?",
        "target_words": ["Kompetenz", "diskriminieren", "Gleichstellung"]
    },
    {
        "id": 415,
        "level": "C1",
        "theme": "Digital Detox & Mental Health",
        "question": "Welche psychologischen Langzeitfolgen hat die ständige digitale Erreichbarkeit?",
        "question_en": "What are the long-term psychological consequences of constant digital availability?",
        "target_words": ["Reizüberflutung", "Aufmerksamkeit", "entschleunigen"]
    },
    {
        "id": 416,
        "level": "C1",
        "theme": "Scientific Skepticism",
        "question": "Warum verlieren viele Menschen das Vertrauen in die Wissenschaft und Fakten?",
        "question_en": "Why are many people losing trust in science and facts?",
        "target_words": ["Verschwörungstheorie", "Objektivität", "Skepsis"]
    },
    {
        "id": 417,
        "level": "C1",
        "theme": "Prison System",
        "question": "Sollte der Strafvollzug eher auf Bestrafung oder auf Resozialisierung setzen?",
        "question_en": "Should the penal system focus more on punishment or on rehabilitation?",
        "target_words": ["Rückfallquote", "Gesellschaft", "Sühne"]
    },
    {
        "id": 418,
        "level": "C1",
        "theme": "Urban Mobility",
        "question": "Wie sieht die Stadt der Zukunft ohne private PKWs aus?",
        "question_en": "What does the city of the future look like without private cars?",
        "target_words": ["Infrastruktur", "Lebensqualität", "Emissionen"]
    },
    {
        "id": 419,
        "level": "C1",
        "theme": "Consumer Responsibility",
        "question": "Kann der einzelne Konsument die Welt retten oder braucht es politische Verbote?",
        "question_en": "Can the individual consumer save the world or are political bans needed?",
        "target_words": ["Einfluss", "regulieren", "Machtlosigkeit"]
    },
    {
        "id": 420,
        "level": "C1",
        "theme": "Intergenerational Conflict",
        "question": "Werden die Ressourcen fair zwischen den Generationen verteilt (Rente, Klima)?",
        "question_en": "Are resources distributed fairly between generations (pension, climate)?",
        "target_words": ["Solidarität", "Last", "Gerechtigkeit"]
    },
    {
        "id": 421,
        "level": "C1",
        "theme": "Leadership Styles",
        "question": "Was zeichnet eine moderne Führungskraft aus: Autorität oder Empathie?",
        "question_en": "What characterizes a modern leader: authority or empathy?",
        "target_words": ["Hierarchie", "motivieren", "auf Augenhöhe"]
    },
    {
        "id": 422,
        "level": "C1",
        "theme": "Media Literacy",
        "question": "Sollte Medienkompetenz ein Pflichtfach an allen Schulen sein?",
        "question_en": "Should media literacy be a compulsory subject in all schools?",
        "target_words": ["analysieren", "manipulativ", "Lehrplan"]
    },
    {
        "id": 423,
        "level": "C1",
        "theme": "Alternative Medicine",
        "question": "Sollten Krankenkassen auch alternative Heilmethoden (z.B. Homöopathie) bezahlen?",
        "question_en": "Should health insurance companies also pay for alternative healing methods (e.g., homeopathy)?",
        "target_words": ["Wirksamkeit", "Placebo", "schulmedizinisch"]
    },
    {
        "id": 424,
        "level": "C1",
        "theme": "Patriotism vs. Nationalism",
        "question": "Ist Patriotismus in einer globalisierten Welt noch zeitgemäß?",
        "question_en": "Is patriotism still appropriate in a globalized world?",
        "target_words": ["Zugehörigkeit", "Grenze", "stolz"]
    },
    {
        "id": 425,
        "level": "C1",
        "theme": "Minimalism",
        "question": "Ist Minimalismus ein privilegierter Lifestyle oder eine Antwort auf den Kapitalismus?",
        "question_en": "Is minimalism a privileged lifestyle or an answer to capitalism?",
        "target_words": ["Überfluss", "verzichten", "Fokus"]
    }
]

C2_QUESTIONS = [
    {
        "id": 501,
        "level": "C2",
        "theme": "Linguistic Relativity",
        "question": "Inwiefern bestimmt die Struktur unserer Sprache die Art und Weise, wie wir die Welt wahrnehmen (Sapir-Whorf-Hypothese)?",
        "question_en": "To what extent does the structure of our language determine the way we perceive the world (Sapir-Whorf hypothesis)?",
        "target_words": ["kognitiv", "Determinismus", "implizieren"]
    },
    {
        "id": 502,
        "level": "C2",
        "theme": "The Crisis of Democracy",
        "question": "Erleben wir aktuell eine Erosion demokratischer Werte oder lediglich einen notwendigen Transformationsprozess?",
        "question_en": "Are we currently experiencing an erosion of democratic values or merely a necessary transformation process?",
        "target_words": ["Resilienz", "populistisch", "polarisieren"]
    },
    {
        "id": 503,
        "level": "C2",
        "theme": "Philosophy of Artificial Intelligence",
        "question": "Wenn eine KI ein Bewusstsein entwickelt, müssen wir ihr dann Menschenrechte zugestehen?",
        "question_en": "If an AI develops consciousness, must we then grant it human rights?",
        "target_words": ["Empfindungsfähigkeit", "ethisch", "Subjektstatus"]
    },
    {
        "id": 504,
        "level": "C2",
        "theme": "The Illusion of Meritocracy",
        "question": "Ist die Meritokratie (Leistungsgesellschaft) ein gerechtes Ideal oder ein Mythos, der Ungleichheit verschleiert?",
        "question_en": "Is meritocracy a just ideal or a myth that disguises inequality?",
        "target_words": ["Privileg", "Chancengerechtigkeit", "reproduzieren"]
    },
    {
        "id": 505,
        "level": "C2",
        "theme": "Degrowth Economics",
        "question": "Ist das Konzept der Postwachstumsökonomie eine realistische Alternative zum Kapitalismus oder eine Utopie?",
        "question_en": "Is the concept of degrowth economics a realistic alternative to capitalism or a utopia?",
        "target_words": ["Ressourcenknappheit", "Wohlstand", "Paradigmenwechsel"]
    },
    {
        "id": 506,
        "level": "C2",
        "theme": "Algorithmic Bias",
        "question": "Wie verhindern wir, dass Algorithmen menschliche Vorurteile und Diskriminierung automatisieren?",
        "question_en": "How do we prevent algorithms from automating human prejudice and discrimination?",
        "target_words": ["Voreingenommenheit", "Transparenz", "diskret"]
    },
    {
        "id": 507,
        "level": "C2",
        "theme": "Transhumanism",
        "question": "Sollte der Mensch durch Technologie seine biologischen Grenzen überwinden (Transhumanismus)?",
        "question_en": "Should humans overcome their biological limits through technology (transhumanism)?",
        "target_words": ["Evolution", "Optimierung", "Obsoleszenz"]
    },
    {
        "id": 508,
        "level": "C2",
        "theme": "Truth in the Post-Factual Era",
        "question": "Hat der Begriff der 'objektiven Wahrheit' im Zeitalter von Deepfakes und Echokammern ausgedient?",
        "question_en": "Has the concept of 'objective truth' become obsolete in the age of deepfakes and echo chambers?",
        "target_words": ["Verifizierung", "Desinformation", "epistemisch"]
    },
    {
        "id": 509,
        "level": "C2",
        "theme": "Neocolonialism",
        "question": "Inwiefern setzen moderne Handelsstrukturen koloniale Abhängigkeitsverhältnisse fort?",
        "question_en": "To what extent do modern trade structures perpetuate colonial dependency relationships?",
        "target_words": ["Ausbeutung", "Souveränität", "asymmetrisch"]
    },
    {
        "id": 510,
        "level": "C2",
        "theme": "The Purpose of Art",
        "question": "Darf Kunst rein ästhetisch sein, oder hat sie die Pflicht, gesellschaftliche Missstände anzuprangern?",
        "question_en": "May art be purely aesthetic, or does it have the duty to denounce social grievances?",
        "target_words": ["autonom", "Engagement", "diskursiv"]
    },
    {
        "id": 511,
        "level": "C2",
        "theme": "Universal Jurisdiction",
        "question": "Sollten Diktatoren vor internationalen Gerichten belangt werden können, auch wenn sie die Souveränität ihres Landes beanspruchen?",
        "question_en": "Should dictators be liable before international courts, even if they claim their country's sovereignty?",
        "target_words": ["Immunität", "Völkerrecht", "Präzedenzfall"]
    },
    {
        "id": 512,
        "level": "C2",
        "theme": "Genetic Engineering (Designer Babies)",
        "question": "Führt die Möglichkeit, das Erbgut von Embryonen zu bearbeiten, zwangsläufig zu einer Zweiklassengesellschaft?",
        "question_en": "Does the ability to edit the genome of embryos inevitably lead to a two-tier society?",
        "target_words": ["Eugenik", "Selektion", "ethisch vertretbar"]
    },
    {
        "id": 513,
        "level": "C2",
        "theme": "Urban Gentrification Nuances",
        "question": "Ist Gentrifizierung ein unvermeidbarer Nebeneffekt städtischer Entwicklung oder politisches Versagen?",
        "question_en": "Is gentrification an unavoidable side effect of urban development or political failure?",
        "target_words": ["Segregation", "Revitalisierung", "sozioökonomisch"]
    },
    {
        "id": 514,
        "level": "C2",
        "theme": "Identity Politics",
        "question": "Fördert Identitätspolitik die Inklusion oder führt sie zur Fragmentierung der Gesellschaft?",
        "question_en": "Does identity politics promote inclusion or lead to the fragmentation of society?",
        "target_words": ["Partikularinteressen", "marginalisiert", "Solidarität"]
    },
    {
        "id": 515,
        "level": "C2",
        "theme": "Work and Meaning",
        "question": "Wie definieren wir den Sinn des Lebens in einer Welt, in der Erwerbsarbeit zunehmend automatisiert wird?",
        "question_en": "How do we define the meaning of life in a world where gainful employment is increasingly automated?",
        "target_words": ["Müßiggang", "Selbstverwirklichung", "Grundeinkommen"]
    },
    {
        "id": 516,
        "level": "C2",
        "theme": "Privacy vs. Public Health",
        "question": "War die Einschränkung von Freiheitsrechten während der Pandemie verhältnismäßig?",
        "question_en": "Was the restriction of civil liberties during the pandemic proportionate?",
        "target_words": ["Grundrechte", "Abwägung", "Prävention"]
    },
    {
        "id": 517,
        "level": "C2",
        "theme": "Diplomacy vs. Conflict",
        "question": "Ist 'Soft Power' (kulturelle Attraktivität) heute wirkungsvoller als militärische Stärke?",
        "question_en": "Is 'soft power' (cultural attractiveness) more effective today than military strength?",
        "target_words": ["Diplomatie", "Einflusssphäre", "sanktionieren"]
    },
    {
        "id": 518,
        "level": "C2",
        "theme": "Educational Philosophy",
        "question": "Sollte Bildung dem Humboldtschen Ideal der Persönlichkeitsbildung folgen oder rein arbeitsmarktorientiert sein?",
        "question_en": "Should education follow the Humboldtian ideal of character formation or be purely labor market oriented?",
        "target_words": ["utilitaristisch", "Bildungsideal", "Kompetenz"]
    },
    {
        "id": 519,
        "level": "C2",
        "theme": "Corporate Social Responsibility",
        "question": "Ist CSR (Corporate Social Responsibility) meistens nur 'Greenwashing' oder ein echter Wandel?",
        "question_en": "Is CSR mostly just 'greenwashing' or a real change?",
        "target_words": ["Imagepflege", "Glaubwürdigkeit", "Profitmaximierung"]
    },
    {
        "id": 520,
        "level": "C2",
        "theme": "The Death of the Author",
        "question": "Sollte man das Werk eines Künstlers getrennt von seiner moralischen Verfehlung als Person betrachten?",
        "question_en": "Should one view an artist's work separately from their moral misconduct as a person?",
        "target_words": ["boykottieren", "Rezeption", "Differenzierung"]
    },
    {
        "id": 521,
        "level": "C2",
        "theme": "Surveillance Capitalism",
        "question": "Haben wir die Kontrolle über unsere persönlichen Daten im Zeitalter des Überwachungskapitalismus unwiderruflich verloren?",
        "question_en": "Have we irrevocably lost control over our personal data in the age of surveillance capitalism?",
        "target_words": ["Kommodifizierung", "Verhaltensvorhersage", "Autonomie"]
    },
    {
        "id": 522,
        "level": "C2",
        "theme": "Cryptocurrencies",
        "question": "Stellen Kryptowährungen eine Demokratisierung des Finanzwesens dar oder ein spekulatives Risiko?",
        "question_en": "Do cryptocurrencies represent a democratization of finance or a speculative risk?",
        "target_words": ["dezentral", "Volatilität", "Regulierung"]
    },
    {
        "id": 523,
        "level": "C2",
        "theme": "Globalization of Culture",
        "question": "Führt die globale Dominanz der englischen Sprache zum Aussterben kleinerer Sprachen und Denkweisen?",
        "question_en": "Does the global dominance of the English language lead to the extinction of smaller languages and ways of thinking?",
        "target_words": ["Hegemonie", "Sprachtod", "kulturelles Erbe"]
    },
    {
        "id": 524,
        "level": "C2",
        "theme": "Utilitarianism vs. Deontology",
        "question": "Darf man wenige Menschen opfern, um viele zu retten? (Das Trolley-Problem im echten Leben)",
        "question_en": "May one sacrifice a few people to save many? (The trolley problem in real life)",
        "target_words": ["moralisch", "quantifizieren", "Prinzipienethik"]
    },
    {
        "id": 525,
        "level": "C2",
        "theme": "Historical Revisionism",
        "question": "Wie sollten Nationen mit den dunklen Kapiteln ihrer Geschichte umgehen: Verdrängen oder Aufarbeiten?",
        "question_en": "How should nations deal with the dark chapters of their history: repress or process?",
        "target_words": ["Erinnerungskultur", "kollektives Gedächtnis", "Verantwortung"]
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
