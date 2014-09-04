<?php

  /* 
   * Single Webservice Request
   */
  function url_get_contents($url, $callback) {
      if (!function_exists('curl_init')){ 
          die('CURL is not installed!');
      }
      $ch = curl_init();
      curl_setopt($ch, CURLOPT_URL, $url);
      curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
      $output = curl_exec($ch);
      $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE); //get the code of request
      curl_close($ch);

      if($httpCode == 400) return 'Bummer';

      if($httpCode == 200) {
      
        // do some fancy stuff here
      
        header('Content-Type: application/javascript');   
        echo $callback . '(' . $output . ');';  

      }
  }

  //retrieve parameters and request data from an external url
  $url = 'http://api.yelp.com/business_review_search?ywsid=ftPpQUCgfSA3yV98-uJn9g&term=Taxi';
  $location = filter_input(INPUT_GET, 'location', FILTER_SANITIZE_ENCODED);
  $callbackkey = filter_input(INPUT_GET, 'callback', FILTER_SANITIZE_ENCODED);

  url_get_contents($url . "&location=" . $location, $callbackkey);
?>