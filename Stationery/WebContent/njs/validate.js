/**
 * 值不小于0校验
 * @时间 2017-01-29
 * @author 范立炎
 */
function isNotltZero(strValue, boxObj, paramsObj){
	var value = null;
	try{
		value = parseInt(strValue);
	}catch (e) {
		return false;
	}
	 if(value < 0){
		 return false;
	 }
	 return true;
}

/**
 * 值必须大于0校验
 * @时间 2017-02-05
 * @author 范立炎
 */
function isGtZero(strValue, boxObj, paramsObj){
	var value = null;
	try{
		value = parseInt(strValue);
	}catch(e){
		return false;
	}
	
	if(value <= 0){
		return false;
	}
	return true;
}
//   function onlyNum(strValue, boxObj, paramsObj){
//	   var reg = /^-?//d+$/;
//	   if(!reg.test(strValue)){
//		   return false;
//	   }
//	   return true;
//   }
//function onlyNum(strValue, boxObj, paramsObj) {
//	alert("进入");
//    if(!(event.keyCode==46)&&!(event.keyCode==8)&&!(event.keyCode==37)&&!(event.keyCode==39)){
//    	alert("第一层");
//    	 if(!((event.keyCode>=48&&event.keyCode<=57)||(event.keyCode>=96&&event.keyCode<=105))){
//    		 alert("第二层");
////    		 event.returnValue=false;
//    		 return false;
//    	 }
//        } 
//    return true;
//}