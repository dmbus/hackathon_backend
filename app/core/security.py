from enum import Enum

class UserRole(str, Enum):
    ADMIN = "admin"
    TEACHER = "teacher"
    STUDENT_PREMIUM = "student_premium"
    STUDENT_FREE = "student_free"

ROLES_PERMISSIONS = {
    UserRole.ADMIN: [
        "manage_users", "view_system_logs", "manage_all_words", 
        "create_deck", "edit_deck", "upload_media", "view_test_results",
        "access_podcasts", "unlimited_srs", "learning_paths",
        "access_basic_words", "public_decks"
    ],
    UserRole.TEACHER: [
        "create_deck", "edit_deck", "upload_media", "view_test_results",
        "access_basic_words", "public_decks"
    ],
    UserRole.STUDENT_PREMIUM: [
        "access_podcasts", "unlimited_srs", "learning_paths",
        "access_basic_words", "public_decks"
    ],
    UserRole.STUDENT_FREE: [
        "access_basic_words", "public_decks"
    ],
}
