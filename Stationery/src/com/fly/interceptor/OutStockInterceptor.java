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

public class OutStockInterceptor extends AbsInterceptorDefaultAdapter {

	@Override
	public void doStart(ReportRequest rrequest, ReportBean rbean) {
		rrequest.authorize("editOutStockReport",Consts.DATA_PART,"outprice","readonly","true");
        rrequest.authorize("editOutStockReport",Consts.DATA_PART,"outtolprice","readonly","true");
	}

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
			String sql = "select off_sup_name, off_sup_accout from office_stock where off_sup_name = ?";
			try {
				ps = conn.prepareStatement(sql);
				ps.setInt(1, goodsNameId);
				rs = ps.executeQuery();
				while(!rs.next()){
					rrequest.getWResponse().setStatecode(Consts.STATECODE_FAILED);
					rrequest.getWResponse().getMessageCollector().alert("库存里不存在该商品，请先添加库存！");;
					return WX_RETURNVAL_TERMINATE;
				}
				int goodsNumber = rs.getInt("off_sup_accout");
				if(goodsNumber == 0){
					rrequest.getWResponse().setStatecode(Consts.STATECODE_FAILED);
					rrequest.getWResponse().getMessageCollector().alert("该商品缺货，无法出库！");;
					return WX_RETURNVAL_TERMINATE;
				}
				int outnumber = Integer.parseInt(mRowData.get("outnumber"));
				
				if("修改".equals(message)){
					int oldOutnumber = Integer.parseInt(mRowData.get("outnumber__old"));
					int oldGoodsNameId = Integer.parseInt(mRowData.get("off_id__old"));
					if(outnumber > goodsNumber){
						rrequest.getWResponse().setStatecode(Consts.STATECODE_FAILED);
						rrequest.getWResponse().getMessageCollector().alert("该商品库存不足，无法出库！");;
						return WX_RETURNVAL_TERMINATE;
					}else{
						String sql1 = "update office_stock set off_sup_accout = off_sup_accout - ? where off_sup_name = ?";
						ps = conn.prepareStatement(sql1);
						ps.setInt(1, outnumber);
						ps.setInt(2, goodsNameId);
						ps.executeUpdate();
						
						String sql2 = "update office_stock set off_sup_accout = off_sup_accout + ? where off_sup_name = ?";
						ps = conn.prepareStatement(sql2);
						ps.setInt(1, oldOutnumber);
						ps.setInt(2, oldGoodsNameId);
						ps.executeUpdate();
						
						String sql3 = "update outstock set off_id = ?, outprice = ?, outnumber = ?, outtolprice = ?, receive_man = ? where out_id = ?";
						ps = conn.prepareStatement(sql3);
						ps.setInt(1, goodsNameId);
						ps.setDouble(2, Double.parseDouble(mRowData.get("outprice")));
						ps.setInt(3, Integer.parseInt(mRowData.get("outnumber")));
						ps.setDouble(4, Double.parseDouble(mRowData.get("outtolprice")));
						ps.setString(5, mRowData.get("receive_man"));
						ps.setInt(6, Integer.parseInt(mRowData.get("out_id")));
						ps.executeUpdate();
						return WX_RETURNVAL_SUCCESS;
					}
				}else if("添加".equals(message)){
					if(outnumber > goodsNumber){
						rrequest.getWResponse().setStatecode(Consts.STATECODE_FAILED);
						rrequest.getWResponse().getMessageCollector().alert("该商品库存不足，无法出库！");;
						return WX_RETURNVAL_TERMINATE;
					}else{
						String sql4 = "update office_stock set off_sup_accout = off_sup_accout - ? where off_sup_name = ?";
						ps = conn.prepareStatement(sql4);
						ps.setInt(1, outnumber);
						ps.setInt(2, goodsNameId);
						ps.executeUpdate();
						
						String sql5 = "insert into outstock (off_id,outprice,outnumber,outtolprice,receive_man) values(?,?,?,?,?)";
						ps = conn.prepareStatement(sql5);
						ps.setInt(1, goodsNameId);
						ps.setDouble(2, Double.parseDouble(mRowData.get("outprice")));
						ps.setInt(3, Integer.parseInt(mRowData.get("outnumber")));
						ps.setDouble(4, Double.parseDouble(mRowData.get("outtolprice")));
						ps.setString(5, mRowData.get("receive_man"));
						ps.executeUpdate();
						return WX_RETURNVAL_SUCCESS;
					}
				}
				}catch (SQLException e) {
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
		return WX_RETURNVAL_SKIP;
	}

	
}
