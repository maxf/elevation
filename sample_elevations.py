import requests
import json
import numpy as np
import argparse

parser = argparse.ArgumentParser(
    description='Create a grid of lat/lon/elevations'
)

parser.add_argument(
    'samples_lat',
    metavar='<Samples-Lat>',
    type=int,
    help='Number of samples along latitude')

parser.add_argument(
    'samples_lon',
    metavar='<Samples-Lon>',
    type=int,
    help='Number of samples along longitude')

parser.add_argument(
    'output_file',
    metavar='<Output-filename>',
    type=argparse.FileType('w'),
    help='Output filename')

args = parser.parse_args()

output_file = args.output_file
samples_lat = args.samples_lat
samples_lon = args.samples_lon

# British isles
east = 2.5
west = -11
north = 59.5
south = 49.5

# whole earth
# east = 180;
# west = -180;
# north = 90;
# south = -90

elevation_api_limit = 400
nb_groups = 1 + samples_lat * samples_lon // elevation_api_limit


lons = np.linspace(west, east, samples_lat)
lats = np.linspace(north, south, samples_lon)

samples = np.array([])

for lat in lats:
    for lon in lons:
        samples = np.append(samples, {"latitude": lat, "longitude": lon})

sample_groups = np.array_split(samples, nb_groups)

print("We're going to fetch {} elevations from the server using {} http calls"
      .format(len(samples), len(sample_groups)))

response_points = []
for i, group in enumerate(sample_groups):
    locations = group.tolist()
    post_payload = {"locations": locations}
    print("Requesting {} elevations ({}/{})".format(
        len(locations), i+1, len(sample_groups)))
    response = requests.post(
        "https://api.open-elevation.com/api/v1/lookup",
        json=post_payload
    )
    if response.status_code != 200:
        raise Exception("Status code {} received" % response.status_code)
    else:
        response_object = json.loads(response.text)
        response_points += response_object["results"]

np_position_matrix = np.reshape(
    np.array(response_points),
    (samples_lat, samples_lon))


extract_elevation = np.vectorize(lambda p: p["elevation"])
extract_lat = np.vectorize(lambda p: p["latitude"])
extract_lon = np.vectorize(lambda p: p["longitude"])


elevations = extract_elevation(np_position_matrix)
lats = extract_lat(np_position_matrix)
lons = extract_lon(np_position_matrix)


# convert to python list to output as json
positions = np.stack((lats, lons, elevations), axis=-1)

print("Writing output to " + output_file.name)
output_file.write(json.dumps(positions.tolist()))
output_file.close()
print("done.")
