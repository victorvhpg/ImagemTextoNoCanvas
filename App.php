<?php

class App {

    //http://php.net/manual/en/function.getenv.php
    public static function appID() {
        return getenv('FACEBOOK_APP_ID');
    }

    public static function appSecret() {
        return getenv('FACEBOOK_SECRET');
    }

    public static function getAppUrlNoFacebook() {
        return "https://apps.facebook.com/" . self::appID();
    }

    public static function salvaArquivo() {
        
    }

}
