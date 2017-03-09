package com.fly.interceptor;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.Map;


import com.wabacus.config.component.application.report.ReportBean;
import com.wabacus.system.ReportRequest;
import com.wabacus.system.component.application.report.configbean.editablereport.AbsEditableReportEditDataBean;
import com.wabacus.system.component.application.report.configbean.editablereport.EditableReportInsertDataBean;
import com.wabacus.system.component.application.report.configbean.editablereport.EditableReportUpdateDataBean;
import com.wabacus.system.intercept.AbsInterceptorDefaultAdapter;
import com.wabacus.util.Consts;

public class StockInterceptor extends AbsInterceptorDefaultAdapter {

	/**
	 * 保存库存商品前判断库存是不是存在该商品，若存在则中止保存
	 * @author 范立炎
	 * @时间 2017-02-05
	 */
	@Override
	public int doSavePerRow(ReportRequest rrequest, ReportBean rbean, Map<String, String> mRowData,
			Map<String, String> mParamValues, AbsEditableReportEditDataBean editbean) {
		String message = "";
		Connection conn = rrequest.getConnection();
		PreparedStatement ps = null;
		ResultSet rs = null;
		if(editbean instanceof EditableReportInsertDataBean){
			message = "添加";
		}else if(editbean instanceof EditableReportUpdateDataBean){
			message = "修改";
		}
		int goodsNameId = Integer.parseInt(mRowData.get("off_sup_name"));
		String sql = "select off_sup_name from office_stock where off_sup_name = ?";
		try {  
			 ps = conn.prepareStatement(sql);
		     ps.setInt(1, goodsNameId);
			 rs = ps.executeQuery();
			while(rs.next()){
				
				if("添加".equals(message)){
				 rrequest.getWResponse().setStatecode(Consts.STATECODE_FAILED);
				 rrequest.getWResponse().getMessageCollector().alert("库存已存在此商品，若需对其操作请进行修改操作！");
				  return WX_RETURNVAL_TERMINATE;
				}else if("修改".equals(message)){
					  rrequest.getWResponse().setStatecode(Consts.STATECODE_SUCCESS);
						return super.doSavePerRow(rrequest,rbean,mRowData,mParamValues,editbean); 
					}
					
				}			
		} catch (SQLException e) {
			e.printStackTrace();
		}finally{
			if(rs != null){
				try {
					rs.close();
				} catch (SQLException e) {
					e.printStackTrace();
				}
			  rs = null;
			}
			if(ps != null){
				try {
					ps.close();
				} catch (SQLException e) {
					e.printStackTrace();
				}
				ps = null;
		}
		}
		return super.doSavePerRow(rrequest,rbean,mRowData,mParamValues,editbean);
	}
}
