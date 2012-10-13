 
var GerenciaFB = {
    APP : {
        //id  da app
        id : "",
        // url do arquivo channel  //o sdk FB precisa disso
        channelUrl : "",
        //url da app no facebook
        appUrlFacebookApp : "", 
        //permissoes que a app  tera
        permissoes : "",  
        //id do usuario
        userID : "", // "publish_actions,publish_stream,user_photos"
        //permissoes obrigatorias , fica pedindo ate o usuario aceite senao aceitar  fica em loop pedindo :)
        permissoesObrigatorias : []  // ["publish_actions","user_photos"]
    },
    init : function(APP,callbackQuandoAutenticado){
        this.APP = APP;
                   
        //este metodo sera chamado pelo o SDK FB quando ele estiver carregado
        window.fbAsyncInit = function() {
            console.log( "SDK fb carregou");
            //https://developers.facebook.com/docs/reference/javascript/FB.init/
            FB.init({
                appId      : APP.id, // App ID
                channelUrl : APP.channelUrl, // Channel  
                status     : false, // verifica login logo de inicio
                cookie     : false, // cookie para acessar no servidor
                xfbml      : false // usa tags xfbml
            });
            console.log( "getLoginStatus:");
            //https://developers.facebook.com/docs/reference/javascript/FB.getLoginStatus/
            FB.getLoginStatus(function (respostaJSON) {
                console.log( "getLoginStatus = " + respostaJSON.status);
                if (respostaJSON.status === 'connected') {//autenticado e possui acesso a APP
                    GerenciaFB.APP.userID = respostaJSON.authResponse.userID;
                    GerenciaFB.APP.accessToken = respostaJSON.authResponse.accessToken;
                    if(GerenciaFB.APP.permissoesObrigatorias.length > 0 ){
                        //verifica se tem as permissoes obrigatorias
                        GerenciaFB.verificaPermissoesObrigatorias(function(){
                            //oba! ja ta tudo OK
                            callbackQuandoAutenticado(GerenciaFB.APP);
                        });
                    }else{
                        //oba! ja ta tudo OK
                        callbackQuandoAutenticado(GerenciaFB.APP);
                    }   
                } else if (JSON.status === 'not_authorized') {
                    //nao deu acesso
                    GerenciaFB.login();
                } else {
                    //nao esta logado no FB
                    GerenciaFB.login();
                }
            });
        };

                    
        //carrega o SDK js do facebook
        this.carregaSDK();
                 
    },
    pedeAcesso : function(callback){
        console.log("permissions.request");
        
        //abre uma tela pedindo permissao
        FB.ui({
            method: 'permissions.request',
            perms: this.APP.permissoes,
            display: 'iframe',
            access_token :this.APP.accessToken 
        },function(respostaJSON) {
            //retorna um obj  que possui propriedade perms  com as permissoes aceitas
            // ex :    {perms: "publish_stream,user_online_presence"}
            console.log("resposta de permissions.request");
            console.log(respostaJSON);
            callback(respostaJSON);
        });
    },
    verificaPermissoesObrigatorias : function(callback){
        console.log("verificaPermissoesObrigatorias");
        //https://developers.facebook.com/tools/explorer?method=GET&path=me%3Ffields%3Dpermissions
        ///  verificar se tem permissoes extendidas //
        FB.api('/me/permissions', function (respostaJSON) {
            console.log("resposta do /me/permissions");
            console.log(respostaJSON);
            var  i,permissao, vetNaoPossui=[] ;
            for( i = 0 ; i < GerenciaFB.APP.permissoesObrigatorias.length;i++ ){
                permissao = GerenciaFB.APP.permissoesObrigatorias[i];
                //respostaJSON.data[0] obj que contem as permissoes do usuario
                if(!respostaJSON.data[0][permissao] ||  respostaJSON.data[0][permissao] != 1){
                    vetNaoPossui.push(permissao);
                }                           
            }
            //nao possui
            if(vetNaoPossui.length > 0){
                console.log(vetNaoPossui)
                console.log("nao possui em: " + vetNaoPossui.join("#"));
                //pede novamente  as permissoes  caso nao tenha
                GerenciaFB.pedeAcesso(function callbackPermissao(respostaJSON){
                    console.log(respostaJSON);
                    if(respostaJSON && respostaJSON.perms){ // && respostaJSON.perms.indexOf("publish_stream")>=0){
                        var vetAceitas = respostaJSON.perms.split(",");
                        var ok = false;
                        for( var i = 0 ; i < GerenciaFB.APP.permissoesObrigatorias.length;i++ ){
                            var   permissao = GerenciaFB.APP.permissoesObrigatorias[i];
                            ok = false;
                            for(var j = 0; j < vetAceitas.length; j++  ){
                                if(permissao == vetAceitas[j]){
                                    ok = true;
                                    break;
                                }
                            }
                            if(!ok){
                                break;
                            }           
                        }
                        if(!ok){
                            //fica pedindo  em loop
                            GerenciaFB.pedeAcesso(callbackPermissao); 
                        }else{
                            //  oba! ja ta tudo OK
                            callback();
                        }  
                    }else{
                        //fica pedindo  em loop
                        GerenciaFB.pedeAcesso(callbackPermissao);
                    }
                }); 
            }else{
                //oba!! tem todas as permissoes ;)
                callback();
            }

        } );  
                    
    },
    //converte uri base64  para tipo Blob
    dataURI2Blob : function(dataURI) {
        // http://www.ssicom.org/js/x675659.htm
        var binario = atob(dataURI.split(',')[1]);
        var b = [];
        for(var i = 0; i < binario.length; i++) {
            b.push(binario.charCodeAt(i));
        }
        return new Blob([new Uint8Array(b)], {
            type: 'image/png'
        });
    },
    uploadFotoAjax: function(urlBase64,descricao,callback){
        //Gracas ao xhr2  e CORS (CROSS ORIGIN RESOURCE SHARING)
        //podemos fazer requisicao ajax enviando binario em dominios diferentes ;) :-) :) !!!!!!!!!
        var xhr = new XMLHttpRequest();
        var url = "https://graph.facebook.com/me/photos?access_token="+this.APP.accessToken;
        var formData = new FormData();
        //converte a imagem para binario e coloca no form
        formData.append("source", this.dataURI2Blob(urlBase64));
        formData.append("message" , descricao);
        xhr.open('POST', url, true);
      
        xhr.onreadystatechange = function() { 
            if(this.readyState == 4){
                console.log(JSON.parse(xhr.responseText));
                callback(JSON.parse(xhr.responseText));
            }
           
        };

        xhr.send(formData);  
    } ,
    uploadFoto : function(urlImg , descricao,callback){
      
        FB.api('me/photos', 'post', {
            message:descricao,
            access_token: this.APP.accessToken,
            url: urlImg
        }, function (response) {

            callback(response);
            /*
            if (!response || response.error) {
             
               //console.log("erro");
                    
            } else {
                console.log('id da foto : ' + response.id);
            // top.location.href="https://www.facebook.com/photo.php?fbid="+response.id+"&type=1&makeprofile=1&makeuserprofile=1";
            }*/

        });    
                    
      
    },
    login : function(){
        //========obter autenticacao===========================
        //http://developers.facebook.com/docs/authentication/client-side/
        //redireciona para tela de login
        window.top.location.href= "//www.facebook.com/dialog/oauth/?"+
        "client_id="+this.APP.id+
        "&redirect_uri="+encodeURIComponent(this.APP.appUrlFacebookApp)+
        "&display=page"+
        "&scope="+this.APP.permissoes;   
                    
    },
    carregaSDK : function(){
        console.log( "carregando SDK");     
        //  SDK  do FACEBOOK
        (function(d, s, id) {
            var js, fjs = d.getElementsByTagName(s)[0];
            if (d.getElementById(id)) return;
            js = d.createElement(s);
            js.id = id;
            js.src = "//connect.facebook.net/en_US/all.js";
            fjs.parentNode.insertBefore(js, fjs);
        }(document, 'script', 'facebook-jssdk'));
    }             
};
        