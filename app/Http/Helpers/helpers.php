<?php

if (!function_exists('assets')) {
    function assets($path)
    {
        return asset("themes/sleek/$path");
    }
}
