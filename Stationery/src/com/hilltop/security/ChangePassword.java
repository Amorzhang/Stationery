package com.hilltop.security;

import java.io.PrintWriter;
import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Statement;

import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.servlet.http.HttpSession;

import com.wabacus.config.Config;
import com.wabacus.util.DesEncryptTools;

public class ChangePassword extends HttpServlet {

	private static final long serialVersionUID = 1L;

	// 处理get请求
	public void doGet(HttpServletRequest req, HttpServletResponse res) {
		try {
			// 解决中文乱码
			res.setContentType("text/html;charset=UTF-8");
			String old_password = req.getParameter("old_password");
			String new_password = req.getParameter("new_password");
			HttpSession session = req.getSession();
			String user_id = (String) session.getAttribute("user_id");
			PrintWriter pw = res.getWriter();
			boolean isLegal = false;
			Connection conn = Config.getInstance().getDataSource("").getConnection();
			String sql = " select user_id,user_name,password,is_enable from sys_c_sec_user where user_id= ? and password=? ";
			String updateSql="update sys_c_sec_user set password=?  where user_id=? ";
			PreparedStatement pstmt = null;
			try {
				pstmt = conn.prepareStatement(sql);
				pstmt.setString(1,user_id);
				pstmt.setString(2,DesEncryptTools.encrypt(old_password));
				ResultSet rs = pstmt.executeQuery();
				while (rs.next()) {
					if ("Y".equals(rs.getString("is_enable"))) {
						// 账户可用且旧密码正确
						//修改密码
						PreparedStatement pstmt2 = null;
						pstmt2 = conn.prepareStatement(updateSql);
						pstmt2.setString(1,DesEncryptTools.encrypt(new_password));
						pstmt2.setString(2,user_id);
						pstmt2.executeUpdate();
						// 打印修改成功信息
						isLegal = true;
						pw.println("<html>");
						pw.println("<script language=\"javascript\">");
						pw.println("function closewin(){");
						pw.println("self.opener=null;");
						pw.println("self.close();}");
						pw.println("function clock(){i=i-1");
						pw.println("document.title=\"本窗口将在\"+i+\"秒后自动关闭!\";");
						pw.println("if(i>0)setTimeout(\"clock();\",1000);");
						pw.println("else closewin();}");
						pw.println("var i=3");
						pw.println("clock(); </script>");
						pw.println("<body align='center'>");
						pw.println("<br><br>");
						pw.println("<h1><font color='green'>"
								+ rs.getString("user_name")
								+ ",恭喜你,密码修改成功!</font></h1>");
						pw.println("<body>");
						pw.println("<html>");
					} else {
						isLegal = false;
					}
				}
				if (!isLegal) {
					// 账户非法或旧密码错误
					pw.println("<html>");
					pw.println("<body align='center'>");
					pw.println("<br><br>");
					pw.println("<h1><font color='red'>密码修改失败,请返回重试!</font></h1>");
					pw.println("<body>");
					pw.println("<html>");
				}
				rs.close();
			} catch (SQLException e) {
				e.printStackTrace();
			} finally {
				// stmtconn
			}
		} catch (Exception e) {
			e.printStackTrace();
		}
	}

	// 处理post请求
	public void doPost(HttpServletRequest req, HttpServletResponse res) {
		this.doGet(req, res);
	}
}
