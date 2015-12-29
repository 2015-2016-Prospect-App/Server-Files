// KIND OF PSEUDOCODE FOR NOW

var currentLong = 70.323551;
var currentLat = 132.352323;
var searchRadius = 0.000100;
var searchDiameter = searchRadius * 2;

var locations = db.DBNAME.find({
    longitude:{$lt: currentLong - searchDiameter,
        $gt: currentLong + searchDiameter },
    latitude: {$lt: currentLat - searchDiameter,
        $gt: currentLat + searchDiameter },
    lastUpdated: { $gt: Date.now() - 60000} });

return locations;