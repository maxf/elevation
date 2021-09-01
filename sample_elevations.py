import grequests
import json
import numpy as np

# east =   2.570290
# west = -14.931820
# north = 62.310835
# south = 48.519515


east = 60;
west = -60;
north = 60;
south = -60

samples_lat = 5
samples_lon = 5

elevation_api_limit = 400
nb_groups = 1 + samples_lat * samples_lon // elevation_api_limit


lats = np.linspace(west, east, samples_lat)
lons = np.linspace(north, south, samples_lon)

samples = np.array([])

for lat in lats:
    for lon in lons:
        samples = np.append(samples, {"latitude": lat, "longitude": lon})

sample_groups = np.array_split(samples, nb_groups)

post_requests = []
for group in sample_groups:
    post_payload = {"locations": group.tolist()}

    post_requests.append(
        grequests.post(
            "https://api.open-elevation.com/api/v1/lookup",
            json=post_payload
        )
    )

responses = grequests.map(set(post_requests))

response_points = []
for response in responses:
    if response.status_code != 200:
        raise Exception
    response_object = json.loads(response.text)
    response_points += response_object["results"]

print(json.dumps({
    "response": response_points,
    "nLat": samples_lat,
    "nLon": samples_lon
}))
