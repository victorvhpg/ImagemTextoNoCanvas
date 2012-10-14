<!DOCTYPE html>
<!--
/**
 * @victorvhpg
 * https://github.com/victorvhpg/ImagemTextoNoCanvas
 */
-->

<html>
    <head>
        <meta http-equiv="Content-Type" content="text/html; charset=utf-8">
        <title>ImagemTextoNoCanvas </title>


        <script type="text/javascript" src="ImagemTextoNoCanvas.js"></script>
        <script type="text/javascript" src="GerenciaFB.js"></script>
        <style>
            body{
                background-color: #333;
                color:#fff;


            }   
            *{
                font-family: "Comic Sans MS", cursive;
            }
            canvas{
                cursor: crosshair;
            }
            #divImagem , #divTxtTexto{
                padding: 5px;
                border: 1px solid #777;
                margin: 10px 0;
                background-color: #f7f7f7;
            }

            #txtTexto{
                width: 280px;
                height: 100px;
            }
            #tamanhoFonte{
                width:40px;
            }
            #containerDoCanvas{

                margin: 10px 0;
            }
            #botoesCanvas{
                text-align: center;
                padding: 10px;
            }
            #botoesCanvas input[type="button"]{
                padding: 15px;
            }

            #containerMenu{
                position:fixed;  
                right: 0;top: 55px;
                border:1px solid #000;
                background-color: #fff;
                padding:10px;
                max-width: 300px
            }

            .codigoGitHub{
                position: fixed;
                top:0;
                right: 0;
                font-size: 12px;
                background-color: #000;
                padding: 5px;
                color:#fff;
            }
            .codigoGitHub a{
                color:#fff;
                text-decoration: none;
            }
        </style>
        <script type="text/javascript" >
            
            /**
             * @victorvhpg
             * https://github.com/victorvhpg/ImagemTextoNoCanvas
             */

            
            (function(){
                
                "use strict"
                var GerenciarImagemTextoNoCanvas = {
                    fbOK : false ,
                    vetCanvas : [] , 
                    canvasAtual : null,
                    carregaTipos : function(){
                        var sTp = document.querySelector("#tipoRecurso");
                        var tp = ImagemTextoNoCanvas.getTiposRecurso();
                        var opt;
                        opt = document.createElement("option");
                        opt.setAttribute("value", "");
                        opt.textContent ="--selecione--";
                        sTp.appendChild(opt);
                        for(var i in tp){
                            opt = document.createElement("option");
                            opt.setAttribute("value", i);
                            opt.textContent = tp[i];
                            sTp.appendChild(opt);
                        }
                    },
                    carregaAlbuns : function(){
                        var sA =  document.querySelector("#albumFB");
                        var opt;
                        opt = document.createElement("option");
                        opt.setAttribute("value", "me");
                        opt.textContent ="--album da app--";
                        sA.appendChild(opt);
                        /*
                        GerenciaFB.getAlbuns(function(albuns){
                            albuns.forEach(function(item,indice){
                             
                                opt = document.createElement("option");
                                opt.setAttribute("value", item.id);
                                opt.textContent = item.name;
                                sA.appendChild(opt);
                               
                              
                            });
                        });*/
                    },
                    adicionaRecursoTexto : function(texto ,tamanhoFonte){
                        
                        GerenciarImagemTextoNoCanvas.canvasAtual.addRecursoTexto(texto, tamanhoFonte);
                    },
                    adicionaRecursoImagem : function(src ){
                        var img = new Image();
                        img.onload = function(){
                            GerenciarImagemTextoNoCanvas.canvasAtual.addRecursoImagem(img);
                        };
                        img.src = src; 
                    },
                    adicionaImagemFundo : function(src ){
                        var img = new Image();
                        img.onload = function(){
                            var a =  GerenciarImagemTextoNoCanvas.$configCanvas.querySelector("input[data-config='altura']");
                            var l = GerenciarImagemTextoNoCanvas.$configCanvas.querySelector("input[data-config='largura']");
                          
                            GerenciarImagemTextoNoCanvas.canvasAtual.adicionaImagemFundo(img);
                            a.value = img.height;
                            l.value = img.width;
                        };
                        img.src = src;
                     
                        
                    },
                    leImagem : function(inputFile ,onload){
                        var arquivo ;
                        //somente uma imagem
                        if(inputFile.files.length != 1  || !inputFile.files[0].type.match('image.*')){
                            alert("Selecione um arquivo de IMAGEM");
                            return false;
                        }
                        arquivo = inputFile.files[0];
                        //le o conteudo da imagem usando FileReader
                        var reader = new FileReader();
                        reader.onload = function(){
                            //http://en.wikipedia.org/wiki/Data_URI_scheme
                            //this.result url  "data: ...
                            onload(this.result);
                        };
                        // le no formato URL  base64
                        reader.readAsDataURL(arquivo);
                        
                    },
                    init : function(config){
                        
                        if(!(window.JSON && window.File && window.FileReader && window.Blob && window.Uint8Array)){
                            alert("ATENÇÃO seu navegador está desatualizado ou não segue os padroes WEB, para usar esta APP por favor use FIREFOX ou CHROME atualizados");
                            
                        }
                        
                        
                        var c = ImagemTextoNoCanvas.init({
                            largura : 400 ,
                            altura : 400,
                            $container : config.$caContainer
                        });
                        this.vetCanvas.push(c);
                        this.canvasAtual  = c;
                        this.$configCanvas = config.$configCanvas;
                        //delega o evento de controle da dimensao do canvas
                        [].forEach.apply(this.$configCanvas.querySelectorAll("input[data-config='altura'],input[data-config='largura']"),[function(item,indice){
                                item.addEventListener("change" ,(function(){
                                    var l =this.$configCanvas.querySelector("input[data-config='largura']");
                                    var a = this.$configCanvas.querySelector("input[data-config='altura']");
                                    var largura = parseInt( l.value ,10);
                                    var altura =  parseInt(a.value , 10);
                                    if(largura >  this.canvasAtual.LARGURA_MAX){
                                        alert("largura deve ser <= " + this.canvasAtual.LARGURA_MAX);
                                        l.value = this.canvasAtual.LARGURA_MAX;
                                         
                                    }
                                    if(altura >  this.canvasAtual.ALTURA_MAX){
                                        alert("altura deve ser <= " + this.canvasAtual.ALTURA_MAX);
                                        a.value = this.canvasAtual.ALTURA_MAX;
                                        
                                    }
                                    this.canvasAtual.atualizaDimensaoCanvas(largura,altura);
                                    
                                }).bind(this),false);
                              
                            },GerenciarImagemTextoNoCanvas]);
                            
                        //delega evento ao escolher imagem de fundo 
                        this.$configCanvas.querySelector("#fundoImagem").addEventListener("change", function(e){
                           
                            GerenciarImagemTextoNoCanvas.leImagem(this ,function(uri){
                                GerenciarImagemTextoNoCanvas.adicionaImagemFundo(uri); 
                            });
                          
      
                        }, false);
                        //tipos
                        this.carregaTipos();
                        //evento change  ao escolher tipo de recurso
                        document.querySelector("#tipoRecurso").addEventListener("change", function(){
                            var id="";
                            ["divImagem" ,"divTxtTexto"].forEach(function(item,indice){
                                document.querySelector("#"+item).style.display = "none";
                            });
                             
                            if(this.value == ""){
                                return;
                            }
                            if(this.value == "fotoAmigo"){
                                
                                return;
                            }
                            if(this.value == "imagem"){
                                id = "divImagem";
                            }else if(this.value =="texto"){
                                id="divTxtTexto";
                            } 
                            document.querySelector("#" + id).style.display = "block";
                        }, false);
                        
                        //add recurso imagem
                        document.querySelector("#fileImagemRecurso").addEventListener("change", function(e){
                           
                            GerenciarImagemTextoNoCanvas.leImagem(this ,function(uri){
                                GerenciarImagemTextoNoCanvas.adicionaRecursoImagem(uri);
                            });
                          
      
                        }, false);
                        //add recurso texto
                        document.querySelector("#btnAddRecursoTexto").addEventListener("click", function(e){
                            var txt =   document.querySelector("#txtTexto").value;
                            var f =  document.querySelector("#tamanhoFonte").value;
                            if(txt == ""){
                                alert("digite algo!");
                                return;
                            }
                            GerenciarImagemTextoNoCanvas.adicionaRecursoTexto(txt , parseFloat(f));
                            document.querySelector("#txtTexto").value = "";
                        }, false);
                        document.querySelector("#btnDownload").addEventListener("click", function(e){
                            window.open( GerenciarImagemTextoNoCanvas.canvasAtual.canvas.toDataURL() ,'img'+(+new Date()));
                        }, false);
                        var upload  =false;
                        document.querySelector("#btnPublicarImagem").addEventListener("click", function(e){
                            if(!GerenciarImagemTextoNoCanvas.fbOK){
                                alert("nao deu  permissao para a app ??");
                                return;
                            }
                            if(upload){
                                return;
                            }
                            var v =  document.querySelector("#btnPublicarImagem").value;
                            document.querySelector("#btnPublicarImagem").value="Aguarde... publicando no facebook . . .";
                            upload =true;
                            GerenciaFB.uploadFotoAjax({
                                urlBase64 : GerenciarImagemTextoNoCanvas.canvasAtual.canvas.toDataURL() ,
                                descricao : " ;) ... ",
                                callback : function(respostaJSON){
                                    document.querySelector("#btnPublicarImagem").value = v;
                                    upload = false;
                                    if(respostaJSON && respostaJSON.id){
                                        alert("imagem publicada com sucesso :)");
                                        //falta fazer o limpar canvas
                                        //por enquanto  entao recarrega a pagina  :( 
                                        top.location.href =   GerenciaFB.APP.appUrlFacebookApp;
                                    }
                                },
                                albumID : document.querySelector("#albumFB").value
                            });
                        }, false);
                        
                        
                        
                        this.inicioFB();
                        
                    },//init
                    inicioFB : function(){
                        GerenciaFB.init({ 
                            //id  da app
                            id : "371260829618818",
                            // url do arquivo channel  //o sdk FB precisa disso
                            channelUrl : "https://imagem-texto-no-canvas.herokuapp.com/channel.html",
                            //url da app no facebook
                            appUrlFacebookApp : "https://apps.facebook.com/imagemtextonocanvas", 
                            //permissoes que a app  tera
                            permissoes :  "publish_stream,user_photos",   
                            //permissoes obrigatorias , fica pedindo ate o usuario aceite senao aceitar  fica em loop pedindo :)
                            permissoesObrigatorias : ["publish_stream","user_photos"] 
                        },function(APP){
                            //tudo OK
                            GerenciarImagemTextoNoCanvas.fbOK =true;
                            GerenciarImagemTextoNoCanvas.carregaAlbuns();
                        }); 
                      
                    },
                    
                    adicionarCanvas : function(config){
                      
                        //...
                    }
                    
            
                }; 
                window.addEventListener("DOMContentLoaded", function(){
                    GerenciarImagemTextoNoCanvas.init({
                        $caContainer  : document.querySelector("#containerDoCanvas"),
                        $configCanvas : document.querySelector("#configCanvas")
                    });
                
                }, false);
            })();
            
          
        
       
        
        
    
        </script>
    </head>
    <body>
        <div style="color:#333">
            <div style="float:left;padding:10px;background-color: #fff;margin-bottom: 10px;margin-right: 10px">

                <div id="configCanvas" >

                    <strong> Dimensões: </strong><br />
                    largura: <input  data-config="largura"  size="4" type="number" step="10" min="70" max="700" value="400" /> 
                    altura: <input  data-config="altura"    size="4" type="number" step="10" min="70" max="700" value="400" />
                    <br />
                    <strong > Imagem de Fundo: </strong>
                    <input type="file" accept="image/*" id="fundoImagem"    />
                </div>


                <div id="containerDoCanvas"  > </div>
                <div id="botoesCanvas">
                    <div style="float:left">
                        <input  value="Download da Imagem" type="button" id="btnDownload" />  
                    </div>
                    <div style="float:left">
                        <input  type="button" id="btnPublicarImagem" value="Upload da Imagem no Facebook"/>   <br />
                        publicar no album:<br />
                        <select id="albumFB">

                        </select>
                    </div>
                    <div style="clear:both"></div>
                </div>

            </div>
            <div id="containerMenu"   >

                <strong>  Adicionar Recursos na Imagem: </strong>
                <div>
                    <label> Tipo: </label>
                    <select id="tipoRecurso">

                    </select>



                    <div id="divTxtTexto"  style="display:none">
                        Digite um texto:<br />
                        <textarea id="txtTexto" ></textarea> <br />
                        Tamanho da Fonte: 
                        <input type="number" id="tamanhoFonte" value="55"  step="1"  /><br />

                        <button type="button" id="btnAddRecursoTexto">Adicionar</button> 
                        <br /> <br />
                        OBS: Depois que adiconar  um texto , clique e arraste o texto para mudar as coordenadas dele no canvas.
                    </div>
                    <div id="divImagem" style="display:none;">
                        Selecione uma imagem:<br />
                        <input type="file" accept="image/*" id="fileImagemRecurso"    />
                        <br /> <br />
                        OBS: Depois que adiconar  uma imagem, clique e arraste a  imagem para mudar as coordenadas da imagem no canvas.
                    </div>

                    <!--  <div style="margin-top:30px" >
                          <strong> Recursos já Adicionados: </strong><br />
                          <div id="divListaRecursos">
                              .....
                          </div>
                      </div>
                    -->
                </div>



            </div>
            <div style="clear:both"></div>
        </div>

        <div  class="codigoGitHub" >
            Código fonte disponível no GitHub<br />
            <a target="_blank" href="https://github.com/victorvhpg/ImagemTextoNoCanvas">
                ->  @victorvhpg
            </a> 
        </div>
    </body>
</html>
