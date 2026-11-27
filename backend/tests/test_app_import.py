from app.main import app


def test_fastapi_app_imports_with_versioned_health_routes() -> None:
    assert app.title == "TORQUE API"
    assert str(app.url_path_for("login")) == "/api/v1/auth/login"
    assert str(app.url_path_for("get_current_user_profile")) == "/api/v1/auth/me"
    assert str(app.url_path_for("health_check")) == "/api/v1/health"
    assert str(app.url_path_for("database_health_check")) == "/api/v1/health/database"
