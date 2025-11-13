from src.one_database_system import DatabaseSystem, processData
import traceback


if __name__ == "__main__":
    filename = "./data/job_details.json"

    try:
        processData("./data/job_details.json")
        db_system = DatabaseSystem(reset=True, filename="./data/job_details.json")
        db_system.sync()

    except Exception:
        traceback.print_exc()
