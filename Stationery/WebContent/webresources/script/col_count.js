function colCount() { 
   var inprprice=document.getElementById("apply_add_guid_report1_wxcol_office_price").value;
    var inprnumber=document.getElementById("apply_add_guid_report1_wxcol_sum_account").value;
    var intotalmoney=document.getElementById("apply_add_guid_report1_wxcol_sum_price");
    intotalmoney.value=parseFloat(inprnumber)*parseFloat(inprprice);    
}
/*function myrefresh(){
	document.getElementById("btn_dealReportPage_guid_report1_save_id").onclick=function(){
		
		try{
			saveEditableReportData(
					{pageid:'dealReportPage',savingReportIds:[{reportid:'report1',updatetype:'save'}]}
					)
			}catch(e){
				logErrorsAsJsFileLoad(e);
				}
			window.opener.location.reload();
			artDialog.close();
			 
	}

	}*/
function myrefresh(pageid,componentid)
{
	alert('加载完页面ID：'+pageid+'；组件ID：'+componentid);
}
