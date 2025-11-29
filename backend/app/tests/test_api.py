from fastapi.testclient import TestClient

from app.main import app


client = TestClient(app)


def test_stations_endpoint_returns_data():
    response = client.get("/api/stations")
    assert response.status_code == 200
    stations = response.json()
    assert isinstance(stations, list)
    assert len(stations) >= 1
    assert {"id", "name", "first_year", "last_year"}.issubset(stations[0])


def test_temperature_data_monthly_request():
    payload = {
        "station_ids": ["66062"],
        "mode": "monthly",
        "include_std_band": False,
        "year_range": {"from": 1859, "to": 1860},
    }
    response = client.post("/api/temperature-data", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["mode"] == "monthly"
    assert len(data["series"]) == 1
    assert len(data["series"][0]["points"]) > 0


def test_analytics_endpoint_returns_summary():
    payload = {
        "station_ids": ["66062"],
        "year_range": {"from": 1859, "to": 1860},
    }
    response = client.post("/api/analytics", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["stations_analyzed"] == 1
    assert data["selected_period"]["from"] == 1859
    assert data["selected_period"]["to"] >= 1860
