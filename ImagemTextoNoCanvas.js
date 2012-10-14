/**
 * @victorvhpg
 * https://github.com/victorvhpg/ImagemTextoNoCanvas 
 */
(function(w){
    "use strict";
    var ImagemTextoNoCanvas = function(){
        this.canvas =  document.createElement("canvas"); 
        this.ctx =   null;
        this.$container = null;
        this.vetRecursos  = [];
        this.largura = 600;
        this.altura = 600;
        this.imgFundo = null;
        this.ALTURA_MAX = 700;
        this.LARGURA_MAX = 700;
        this.movendoRecurso = false;
        this.recursoMovendo = null ;
    };
    ImagemTextoNoCanvas.init = function(config){
        return (new ImagemTextoNoCanvas()).init(config);  
    };
    ImagemTextoNoCanvas.prototype = {
        constructor : ImagemTextoNoCanvas  ,
        init : function(config){
            var that = this;
            config = config || {};
            this.ctx =  this.canvas.getContext("2d");
            //container onde ficara o canvas
            this.$container = config.$container || document.querySelector("body");
            this.largura = config.largura || this.largura ;
            this.altura = config.altura || this.altura ;
            this.atualizaDimensaoCanvas(this.largura , this.altura );
            this.canvas.style.border = "1px solid #000";
            this.$container.appendChild(this.canvas);
            this.canvas.addEventListener("mousemove" , function(e){
              
                if(!that.movendoRecurso ){
                    return;
                }
                var coord = that.getMouseXY(e);
                that.movimentaRecurso(coord.x , coord.y);
                  
            });
            this.canvas.addEventListener("mousedown" , function(e){
               
                that.movendoRecurso = true;
                var coord = that.getMouseXY(e);
                //recurso que sera movimentado
                that.recursoMovendo = that.getRecursoPorXY(coord.x , coord.y);
                if(that.recursoMovendo ===null){
                    return;
                }
                //guarda a diferenca para posicionar o curso certo q
                that.recursoMovendo.difXY.x = coord.x - that.recursoMovendo.x ;
                that.recursoMovendo.difXY.y = coord.y - that.recursoMovendo.y ;
            });
            this.canvas.addEventListener("mouseup" , function(e){
                that.movendoRecurso = true;
                that.recursoMovendo =null;
            });
            
            return this;
        },
        destacaRecurso : function(){
 
        },
        movimentaRecurso:function(x,y){
            if(this.recursoMovendo === null){
                return;
            }
            
            this.recursoMovendo.x = x -  this.recursoMovendo.difXY.x;
            this.recursoMovendo.y = y - this.recursoMovendo.difXY.y;
            this.desenhaTudo();   
          
            
        },
        getRecursoPorXY : function(x , y ) {
            var r;
            //comeca do fim pois o ultimo recurso  que esta na coordenada  deve ser retornado 
            //mesmo se ha  mais de um na coordenada so retornara  o mais recente
            for(var i=this.vetRecursos.length-1;i >=0  ;i--){
                r =  this.vetRecursos[i];
                if( x >= r.x && x <= (r.x + r.largura) &&
                    y >= r.y && y <= (r.y + r.altura) ){
                   
                    return r;
                }
            }
            return null;
            
        },
        getMouseXY : function (e) {
           
            var x ,y;
            if (e.pageX || e.pageY) {
                x = e.pageX;
                y = e.pageY;
            }
            else {
                x = e.clientX + document.body.scrollLeft +  document.documentElement.scrollLeft;
                y = e.clientY + document.body.scrollTop + document.documentElement.scrollTop;
            }
            //subtrai a posicao do canvas
            x -= this.canvas.offsetLeft;
            y -= this.canvas.offsetTop;
            return {
                x : x ,
                y : y
            };
        },
        adicionaImagemFundo: function(img){
            if(img == null){
                return;
            }
            if(img.width > this.ALTURA_MAX){
                img.width = this.ALTURA_MAX;
            }
            if(img.height > this.LARGURA_MAX){
                img.height = this.LARGURA_MAX;
            }
            this.imgFundo = img;
            //this.atualizaDimensaoCanvas(img.width , img.width);
            this.canvas.width = img.width;
            this.canvas.height = img.height;
            this.ctx.drawImage(img , 0 , 0 , img.width , img.height);
            this.desenhaRecursos();
        },
        desenhaRecursos : function(){
            for(var i=0;i <  this.vetRecursos.length; i++){
                if(this.vetRecursos[i].tipo  === TipoRecurso.imagem){
                    this.ctx.drawImage(this.vetRecursos[i].img , 0 , 0 ,this.vetRecursos[i].img.width ,this.vetRecursos[i].img.height,
                        this.vetRecursos[i].x ,this.vetRecursos[i].y ,this.vetRecursos[i].largura ,this.vetRecursos[i].altura);
                }else if(this.vetRecursos[i].tipo  === TipoRecurso.texto){
                    this.desenhaTexto(this.vetRecursos[i] );
                }
            }  
        },
        
        atualizaDimensaoCanvas : function(largura , altura){
            if(largura > this.LARGURA_MAX){
                largura = this.LARGURA_MAX;
            }
            if(altura > this.ALTURA_MAX){
                altura = this.ALTURA_MAX;
            }
            this.canvas.width = largura;
            this.canvas.height = altura;
            this.largura = largura;
            this.altura = altura;
        
            //desenhar tudo de novo
            if(this.imgFundo!= null){
                this.imgFundo.width = largura;
                this.imgFundo.height = altura;
                this.adicionaImagemFundo(this.imgFundo);
            }else{
                //desenhar recursos
                this.desenhaRecursos();
            }
       
       
        },
        desenhaTudo  : function(){
            this.ctx.clearRect(0 , 0 ,  this.largura, this.altura);
           
            if(this.imgFundo != null){
                this.adicionaImagemFundo(this.imgFundo);
            }else{
                this.desenhaRecursos();
            }
              
        },
        addRecurso : function(r){
            r.posicao =  this.vetRecursos.length;
            this.vetRecursos.push(r);
            
        },
        validaDimensoes : function(r){
            var l , a;
            if(this.imgFundo!= null){
                l = this.imgFundo.width - 50;
                a = this.imgFundo.height - 50;
            }else{
                l =this.LARGURA_MAX;
                a = this.ALTURA_MAX ;
            }
            if(r.largura > l ){
                r.largura = l;
            }
            if(r.altura > a ){
                r.altura = a;
            }
          
        },
        addRecursoImagem: function(img){
            var r = new Recurso({
                largura : img.width ,
                altura : img.height ,
                tipo : TipoRecurso.imagem,
                img : img
               
            });
            this.validaDimensoes(r);
            this.ctx.drawImage(r.img , 0 , 0 ,img.width , img.height ,//imagem
                r.x , r.y ,r.largura ,r.altura);//canvas
            this.addRecurso(r);
        },
     
        addRecursoTexto: function(texto , tamanhoFonte){
            var r = new Recurso({
                largura : 0 ,
                altura : 0 ,
                tipo : TipoRecurso.texto,
                texto  : {
                    texto : texto,
                    tamanhoFonte : tamanhoFonte
                } 
               
            });
           
            this.desenhaTexto(r);
            this.addRecurso(r);
        },   
        desenhaTexto : function(r){
            this.ctx.save();
            this.ctx.font = r.texto.tamanhoFonte + "px Comic Sans MS";
            this.ctx.strokeStyle = "#000";
            this.ctx.textBaseline = "top";
            this.ctx.lineWidth = 2;
            this.ctx.shadowOffsetX=2;
            this.ctx.shadowOffsetY=2;
            this.ctx.shadowBlur = 5 ;
            this.ctx.shadowColor="#fff";
            this.ctx.strokeText(r.texto.texto,r.x,r.y); 
            r.largura = this.ctx.measureText(r.texto.texto).width;
            r.altura = r.texto.tamanhoFonte * 1.2;
            this.ctx.restore();
        }
    
    };

    var TipoRecurso = {
        imagem : "Imagem" ,
        texto  : "Texto" 
        
    //   fotoAmigo : "Foto de amigo no facebook"
    };


    var Recurso = function(config){
        this.x = config.x || 0;
        this.y = config.y || 0;
        this.largura = config.largura|| 0;
        this.altura =  config.altura || 0;
        this.tipo = config.tipo || TipoRecurso.imagem;
        this.img = config.img || null ;
        this.posicao = -1;
        this.difXY = {//usado apenas para saber a diferenca para deixar o cursor certo quando esta movendo
            x:0,
            y:0
        } 
        this.texto  = config.texto || {
            texto : "",
            tamanhoFonte : 12
        };
    };
    
    
    
    ImagemTextoNoCanvas.getTiposRecurso = function(){
        return TipoRecurso;
    };
    

    
    w["ImagemTextoNoCanvas"] = ImagemTextoNoCanvas;
})(window);
