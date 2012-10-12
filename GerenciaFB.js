 
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
            //https://developers.facebook.com/docs/reference/javascript/FB.init/
            FB.init({
                appId      : APP.id, // App ID
                channelUrl : APP.channelUrl, // Channel  
                status     : false, // verifica login logo de inicio
                cookie     : false, // cookie para acessar no servidor
                xfbml      : false // usa tags xfbml
            });
        };
        //https://developers.facebook.com/docs/reference/javascript/FB.getLoginStatus/
        FB.getLoginStatus(function (respostaJSON) {
            if (respostaJSON.status === 'connected') {//autenticado e possui acesso a APP
                GerenciaFB.APP.userID = respostaJSON.authResponse.userID;
                GerenciaFB.APP.accessToken = respostaJSON.authResponse.accessToken;
                if(GerenciaFB.APP.permissoesObrigatorias.length > 0 ){
                    //verifica se tem as permissoes obrigatorias
                    GerenciaFB.verificaPermissoesObrigatorias();
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
                    
        //carrega o SDK js do facebook
        this.carregaSDK();
                 
    },
    pedeAcesso : function(callback){
        FB.ui({
            method: 'permissions.request',
            perms: this.APP.scope,
            display: 'iframe',
            access_token :this.APP.accessToken 
        },function(respostaJSON) {
            callback(respostaJSON);
        });
    },
    verificaPermissoesObrigatorias : function(){
        //https://developers.facebook.com/tools/explorer?method=GET&path=me%3Ffields%3Dpermissions
        ///  verificar se tem permissoes extendidas //
        FB.api('/me/permissions', function (respostaJSON) {
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
                //pede novamente  as permissoes  caso nao tenha
                GerenciaFB.pedeAcesso(function callback(respostaJSON){
                    console.log(respostaJSON);
                 //   if(respostaJSON && respostaJSON.perms){ // && respostaJSON.perms.indexOf("publish_stream")>=0){
                   //     for( var i = 0 ; i < GerenciaFB.APP.permissoesObrigatorias.length;i++ ){
                                        
                                        
                     //       }
                        /*   if(!nao){
                                       GerenciaFB.pedeAcesso(callback); 
                                   } */
                        //oba! ja ta tudo OK
                      //  callbackQuandoAutenticado(GerenciaFB.APP);
                   // }else{
                        //fica pedindo  em loop
                   //     GerenciaFB.pedeAcesso(callback);
                    //}
                }); 
            }else{
                //oba!! tem todas as permissoes ;)
                callbackQuandoAutenticado(GerenciaFB.APP);
            }

        } );  
                    
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
        