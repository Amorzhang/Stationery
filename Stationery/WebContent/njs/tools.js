/**
 * 工具
 * @author 范立炎
 * @时间 2017-02-07
 */


/**
 * 计算入库总价
 * @author 范立炎
 * @时间 2017-02-07
 */
function incolCount(){
	var dataObj = getEditableReportColValues("editInstock", "editInstockReport", 
			{inprice:true, innumber:true}, null);
		var inprice = parseFloat(dataObj.inprice.value);
		var innumber = parseFloat(dataObj.innumber.value);
		var intolprice = (inprice * innumber).toString();
	    setColValueForDetailReport("editInstock", "editInstockReport", "intolprice", intolprice);
}

/**
 * 获取商品id，调用服务端操作
 * @author 范立炎
 * @时间 2017-02-07
 */
function queryInprice(){
	var dataObj = getEditableReportColValues("editInstock", "editInstockReport", {off_id:true}, null);
	var goodsNameId = dataObj.off_id.value;
	if(goodsNameId === ""){
		return;
	}else{
		var datas = {goodsNameId: goodsNameId};
		invokeServerActionForComponent("editInstock", "editInstockReport", "com.fly.services.QueryPriceService", datas, true, afterQueryInpriceCallback);
	}
}
/**
 * 回调设置入库单价
 * @author 范立炎
 * @时间 2017-02-07
 * @param dataObj
 */
function afterQueryInpriceCallback(dataObj){
	var inprice = dataObj.returnValue;
	if(inprice === ""){
		return;
	}
	setColValueForDetailReport("editInstock", "editInstockReport", "inprice", inprice);
}


/**
 * 获取商品id，调用服务端操作
 * @author 范立炎
 * @时间 2017-03-05
 */
function queryOutprice(){
	var dataObj = getEditableReportColValues("editOutStock", "editOutStockReport", {off_id:true}, null);
	var goodsNameId = dataObj.off_id.value;
	if(goodsNameId === ""){
		return;
	}else{
		var datas = {goodsNameId: goodsNameId};
		invokeServerActionForComponent("editOutStock", "editOutStockReport", "com.fly.services.QueryPriceService", datas, true, afterQueryOutpriceCallback);
	}
}

/**
 * 回调设置出库单价
 * @author 范立炎
 * @时间 2017-03-05
 * @param dataObj
 */
function afterQueryOutpriceCallback(dataObj){
	var outprice = dataObj.returnValue;
	if(outprice === ""){
		return;
	}
	setColValueForDetailReport("editOutStock", "editOutStockReport", "outprice", outprice);
}

/**
 * 计算入库总价
 * @author 范立炎
 * @时间 2017-03-05
 */
function outcolCount(){
	var dataObj = getEditableReportColValues("editOutStock", "editOutStockReport", 
			{outprice:true, outnumber:true}, null);
		var outprice = parseFloat(dataObj.outprice.value);
		var outnumber = parseFloat(dataObj.outnumber.value);
		var outtolprice = (outprice * outnumber).toString();
	    setColValueForDetailReport("editOutStock", "editOutStockReport", "outtolprice", outtolprice);
}

