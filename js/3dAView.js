/*!
 * 3dAView v1.0.1 ~ Copyright (c) Ajaxson, 2017/11/23/ Email Ajaxson@163.com
 * 如有什么问题，请github 留言 或者 邮件
*/

/*
*配置参数
@param(touchBox)  		//触摸板名称	类型 obj/str;	必填
@param(imgObj)  	 	//图片渲染的img 类型 obj/str;	必填
@param(part)  			//图片路径 		类型 str;	必填
@param(type)  			//图片类型 		类型 str; 默认:png   可选  
@param(mixImage)  		//最小的图片名称数量 类型：number; 默认:1；可选
@param(maxImage)  		//最大的图片名称数量 类型：number; 必填
@param(firstView)  		//默认显示第几张 类型：number; 默认:1； 可选
@param(oneRange)  		//多少距离触发显示上/下一张 类型：number; 默认:20px； 可选
@param(setLoadingCall)  //加载中回调 类型：function; 默认: null； 可选
@param(loadCompleteCall) //多少距离触发显示上/下一张 类型：function; 默认:null； 可选
@param(isPrev)  		//到了上一张回调 类型：function; 默认: null； 可选
@param(isNext) 			//到了下一张回调 类型：function; 默认:null； 可选
@param(isChange) 			//到了上一张/下一张回调 类型：function; 默认:null； 可选
*/

/*********************封装*******************/
;(function(win){
	D3 = function(options){
		var that = this;
		// 个人配置
		that.base = {
			touchBox: typeof(options.touchBox) == 'object' ? options.touchBox : document.getElementById(options.touchBox),
			imgObj: typeof(options.imgObj) == 'object' ? options.imgObj : document.getElementById(options.imgObj),
			part: options.part,
			type: options.type || "png",
			mix: options.mixImage || 1,
			max: options.maxImage,
			i: options.firstView || 1,
			oneRange: options.oneRange || 20,
			setLoadingCall: options.setLoadingCall || '',
			loadCompleteCall: options.loadCompleteCall || '',
			isPrev: options.isPrev || '',
			isNext: options.isNext || '',
			isChange: options.isChange || ''
		}


		/**************************系统初始化配置,非人为修改************************************/
		that.imgArray = [],		//初始图片数组
		that.loadP = 0;			//图片加载进度
		that.down = null;		//是否暗了下去
		that.aboutE = {			//鼠标各参数
						downEx: 0,
						downEy: 0,
						moveEx: 0,
						moveEy: 0,
						sumEx: 0,
						sumEy: 0
					}


		/**************************调用方法************************************/
		// 获得图片集合
		that.imgArray = that._imgArrayCreat(that.base.part, that.base.type, that.base.mix, that.base.max);
		// 加载完后回调
		that._loadImg(that.imgArray,function(){		
			// 加载完
			that._defaultView(that.base.i);
			that._touchAndDo(that._touchOrMouse());
			if(that.base.loadCompleteCall && typeof(that.base.loadCompleteCall) == "function"){
				that.base.loadCompleteCall();
			};
		},function(p){
			// 加载中
			that.loadP = p;
			if(that.base.setLoadingCall && typeof(that.base.setLoadingCall) == "function"){
				that.base.setLoadingCall();
			};
		})
	
	}

	// 原型
	D3.prototype = {

		// 生成图片数组
		/*
			*@p 路径
			*@t 图片后缀
			*@mi 最小图片数字
			*@ma 最大图片数字

			return 生成的图片集合
		*/
		_imgArrayCreat: function(p,t,mi,ma){
			var oldArray = [];
			for(var k=mi; k<ma; k++){
				oldArray.push(p+k+"."+t);
			}
			return oldArray;
		},


		// 图片结合loading
		/*
			*@imgUrl 			图片结合数组
			*@loadComplete 		图片结合加载完后回调
			*@setLoadingInfo 	图片加载中回调
		*/
		_loadImg: function (imgUrl,loadComplete,setLoadingInfo){
		    var len = imgUrl.length;
		    var num = 0;
		    var checkLoad = function(){
		        num++;
		        setLoadingInfo && setLoadingInfo(parseInt(num/len*100));
		        if( num == len ){
		            loadComplete && loadComplete();
		        }
		    }
		    var checkImg = function(url){
		        var val= url;
		        var img=new Image();
		        img.onload=function(){
		            if(img.complete==true){
		                checkLoad();
		            }
		        }
		        img.src=val;
		    }
		    for( var i = 0; i < len; i++ ){
		        checkImg(imgUrl[i]);
		    }
		},


		// 显示第几张
		/*
			*@i  
		*/
		_defaultView: function (i){
			var that = this;
			that.base.imgObj.src = that.base.part + that.base.i + "." + that.base.type;
		},


		//兼容触摸touch 和 鼠标mouse
		_touchOrMouse: function (){
			var that = this;
			isTouch = 'ontouchstart' in window;
			var mouseEvents = (isTouch) ?
			{
			    down: 'touchstart',
			    move: 'touchmove',
			    up: 'touchend',
			    over: 'touchstart',
			    out: 'touchend'
			}
			        :
			{
			    down: 'mousedown',
			    move: 'mousemove',
			    up: 'mouseup',
			    over: 'mouseover',
			    out: 'mouseout'
			}	
			return mouseEvents;
		},


		// 触摸各种操作
		/*
			*@touchMouse 触摸与鼠标的兼容  
		*/
		_touchAndDo: function(touchMouse){
			var that = this;
			that.base.touchBox.addEventListener(touchMouse.down,function(e, opts, corner){
				e.preventDefault();
				e = e.changedTouches? e.changedTouches[0] : e;
			 	that.down = this;
			 	that.aboutE.downEx = e.pageX;
			 	that.aboutE.downEy = e.pageY;
			},false)
			that.base.touchBox.addEventListener(touchMouse.move,function(e, opts, corner){
			    if(that.down){
			    	e.preventDefault();
			        e = e.changedTouches? e.changedTouches[0]:e
			        that.aboutE.moveEx = e.pageX;
			        that.aboutE.moveEy = e.pageY;
			        that._viewDo(that.aboutE.moveEx);
			    }
			},false)
			that.base.touchBox.addEventListener(touchMouse.up,function(e, opts, corner){
			    that.down = null;
			},false)
			that.base.touchBox.addEventListener(touchMouse.out,function(e, opts, corner){
			    that.down = null;
			},false)
		},


		// 左右滑动时 检测
		/*
			*@m 移动中的坐标
		*/
		_viewDo(m) {
			var that = this;
			// 向右
			if (that.aboutE.downEx - m > that.base.oneRange) {
				that.aboutE.downEx = m;
				that.base.i = --that.base.i < that.base.mix ? that.base.max : that.base.i;
				that._defaultView(that.base.i);
				// 上一张回调
				if(that.base.isPrev && typeof(that.base.isPrev) == "function"){
					that.base.isPrev();
				};
				if(that.base.isChange && typeof(that.base.isChange) == "function"){
					that.base.isChange();
				};
			} 
			// 向左滑
			else if (that.aboutE.downEx - m < -that.base.oneRange) {
				that.aboutE.downEx = m;
				that.base.i = ++that.base.i > that.base.max ? that.base.mix : that.base.i;
				that._defaultView(that.base.i);
				// 下一张回调
				if(that.base.isNext && typeof(that.base.isNext) == "function"){
					that.base.isNext();
				};
				if(that.base.isChange && typeof(that.base.isChange) == "function"){
					that.base.isChange();
				};
			}
		}

	}
}(window))


// 实例化
// var d = new D3({
// 	touchBox: "myBox",
// 	imgObj: "imgShow",
// 	part: "images/",
// 	maxImage: 51,
// });




