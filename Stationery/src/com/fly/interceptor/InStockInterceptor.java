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

public class InStockInterceptor extends AbsInterceptorDefaultAdapter {

	/**
	 * 
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
		int goodsNameId = Integer.parseInt(mRowData.get("off_id"));
		String sql = "select off_sup_name from office_stock where off_sup_name = ?";
		try {
			ps = conn.prepareStatement(sql);
			ps.setInt(1, goodsNameId);
			rs = ps.executeQuery();
			while(!rs.next()){
				rrequest.getWResponse().setStatecode(Consts.STATECODE_FAILED);
				rrequest.getWResponse().getMessageCollector().alert("库存里不存在该商品，请先添加库存！");;
				return WX_RETURNVAL_TERMINATE;
			}
			if("修改".equals(message)){
				
				int innumber = Integer.parseInt(mRowData.get("innumber"));
				int oldInnumber = Integer.parseInt(mRowData.get("innumber__old"));
				int oldGoodsNameId = Integer.parseInt(mRowData.get("off_id__old"));
				
				String sql1 = "update office_stock set off_sup_accout = off_sup_accout + ? where off_sup_name = ?"; 
			    ps = conn.prepareStatement(sql1);
			    ps.setInt(1, innumber);
			    ps.setInt(2, goodsNameId);
			    ps.executeUpdate();
			    
			    String sql2 = "update office_stock set off_sup_accout=off_sup_accout - ? where off_sup_name = ?";
			    ps = conn.prepareStatement(sql2);
			    ps.setInt(1, oldInnumber);
			    ps.setInt(2, oldGoodsNameId);
			    ps.executeUpdate();
			    
			    String sql3 = "update instock set off_id = ?, inprice = ?, innumber = ?, intolprice = ?, inpeople = ? where id = ?";
			    ps = conn.prepareStatement(sql3);
			    ps.setInt(1, Integer.parseInt(mRowData.get("off_id")));
			    ps.setDouble(2, Double.parseDouble(mRowData.get("inprice")));
			    ps.setInt(3, Integer.parseInt(mRowData.get("innumber")));
			    ps.setDouble(4, Double.parseDouble(mRowData.get("intolprice")));
			    ps.setString(5,mRowData.get("inpeople"));
			    ps.setInt(6, Integer.parseInt(mRowData.get("id")));
			    ps.executeUpdate();
			    
			    return WX_RETURNVAL_SUCCESS;
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
		return super.doSavePerRow(rrequest, rbean, mRowData, mParamValues, editbean);
	}

	@Override
	public void doStart(ReportRequest rrequest, ReportBean rbean) {
		rrequest.authorize("editInstockReport",Consts.DATA_PART,"inprice","readonly","true");
        rrequest.authorize("editInstockReport",Consts.DATA_PART,"intolprice","readonly","true");
	}
	
}
