<?php

// this is a simplified version of a typical php proxy script.
// only purpose is bypass cross domain security

session_start();
ob_start();

$url = "http://rate-exchange.appspot.com/currency?from=" . $_GET["from"] . "&to=" . $_GET["to"];

// Open the cURL session
$curlSession = curl_init();

curl_setopt ($curlSession, CURLOPT_URL, $url);
curl_setopt ($curlSession, CURLOPT_HEADER, 1);
curl_setopt($curlSession, CURLOPT_RETURNTRANSFER,1);
curl_setopt($curlSession, CURLOPT_TIMEOUT,5);

//Send the request and store the result in an array
$response = curl_exec ($curlSession);

// Check that a connection was made
if (curl_error($curlSession)){
        // If it wasn't...
        print curl_error($curlSession);
} else {

        //clean duplicate header that seems to appear on fastcgi with output buffer on some servers!!
        $response = str_replace("HTTP/1.1 100 Continue\r\n\r\n","",$response);

        $ar = explode("\r\n\r\n", $response, 2); 

        $header = $ar[0];
        $body = $ar[1];
        print $body;
}

curl_close ($curlSession);

?>