<?php
//Return response as JavaScript
header('Content-Type: application/javascript'); //<1>

echo '{
    "cars" : [
        { 
            "id" : 1,
            "brand" : "BMW",
            "taxiservice_id" : 1
        },
        { 
            "id" : 2,
            "brand" : "Mercedes",
            "taxiservice_id" : 1
        }       
    ]
}';
?>