# Municipal Priority AI

Random Forest based priority scoring service for NagarSetu complaints.

## Setup

```bash
cd municipal_priority_ai
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
```

## Generate Dataset + Train

```bash
python utils/dataset_generator.py
python model/train_model.py
```

## Run API

```bash
uvicorn api.main:app --reload --port 8005
```

## Example Request

```bash
curl -X POST http://localhost:8005/predict-priority ^
  -H "Content-Type: application/json" ^
  -d "{\"description\":\"Sewage overflow on main road\",\"department\":\"Sanitation\",\"has_evidence\":true,\"location\":\"Ward 12\"}"
```

## Example Fetch

```js
const response = await fetch("http://localhost:8005/predict-priority", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    description: "Sewage overflow on main road",
    department: "Sanitation",
    has_evidence: true,
    location: "Ward 12",
  }),
});
const data = await response.json();
```
