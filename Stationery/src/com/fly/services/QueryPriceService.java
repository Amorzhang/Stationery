package com.fly.services;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.List;
import java.util.Map;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import com.wabacus.config.component.IComponentConfigBean;
import com.wabacus.system.ReportRequest;
import com.wabacus.system.serveraction.IServerAction;
import com.wabacus.util.Consts;

public class QueryPriceService implements IServerAction {

	/**
	 * 根据商品id查询商品单价
	 * @author 范立炎
	 * @时间 2017-02-08
	 */
	@Override
	public String executeSeverAction(ReportRequest rrequest, IComponentConfigBean ccbean,
			List<Map<String, String>> lstData, Map<String, String> mCustomizedData) {
		rrequest.getWResponse().setStatecode(Consts.STATECODE_NONREFRESHPAGE);
		Connection conn = rrequest.getConnection();
		PreparedStatement ps = null;
		ResultSet rs = null;
		String priceStr = "";
		String goodsNameIdTemp = lstData.get(0).get("goodsNameId");
		if("".equals(goodsNameIdTemp)){
			rrequest.getWResponse().terminateResponse(Consts.STATECODE_FAILED);
		}else{
			int goodsNameId = Integer.parseInt(goodsNameIdTemp);
		
		String sql = "select off_price from office_supplies where off_id = " + goodsNameId;
		
		try {
			ps = conn.prepareStatement(sql);
			rs = ps.executeQuery();
			while(rs.next()){
			   Integer price = rs.getInt("off_price");
			   priceStr = price.toString();
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
			
			if(conn != null){
				try {
					conn.close();
				} catch (SQLException e) {
					e.printStackTrace();
				}
				conn = null;
			}
		}
		}
		  return priceStr;
	}

	@Override
	public String executeServerAction(HttpServletRequest request, HttpServletResponse response,
			List<Map<String, String>> lstData) {
		return null;
	}
}
