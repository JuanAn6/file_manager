<?php

return [
    'paths' => ['api/*', 'v1/*'], // o la ruta que use tu API, p.ej. 'v1/*'
    'allowed_methods' => ['*'], // o especifica ['GET','POST','PUT','DELETE','OPTIONS']
    'allowed_origins' => ['http://localhost:5173'], // tu origen frontend
    'allowed_origins_patterns' => [],
    'allowed_headers' => ['*'], // o los encabezados que realmente uses como 'Content-Type','Authorization'
    'exposed_headers' => [],
    'max_age' => 0,
    'supports_credentials' => false, // o true si envías cookies/autorización
];

