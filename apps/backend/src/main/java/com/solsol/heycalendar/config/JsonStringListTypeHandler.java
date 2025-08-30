package com.solsol.heycalendar.config;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.apache.ibatis.type.BaseTypeHandler;
import org.apache.ibatis.type.JdbcType;
import org.apache.ibatis.type.MappedJdbcTypes;
import org.apache.ibatis.type.MappedTypes;

import java.sql.*;
import java.util.List;

@MappedTypes(List.class)
@MappedJdbcTypes({JdbcType.VARCHAR, JdbcType.LONGVARCHAR, JdbcType.OTHER})
public class JsonStringListTypeHandler extends BaseTypeHandler<List<String>> {

	private static final ObjectMapper om = new ObjectMapper();
	private static final TypeReference<List<String>> LIST_STRING = new TypeReference<>() {};

	@Override
	public void setNonNullParameter(PreparedStatement ps, int i, List<String> parameter, JdbcType jdbcType) throws SQLException {
		try {
			ps.setString(i, om.writeValueAsString(parameter));
		} catch (Exception e) {
			throw new SQLException("Failed to serialize List<String> to JSON string", e);
		}
	}

	@Override
	public List<String> getNullableResult(ResultSet rs, String columnName) throws SQLException {
		return parse(rs.getString(columnName));
	}

	@Override
	public List<String> getNullableResult(ResultSet rs, int columnIndex) throws SQLException {
		return parse(rs.getString(columnIndex));
	}

	@Override
	public List<String> getNullableResult(CallableStatement cs, int columnIndex) throws SQLException {
		return parse(cs.getString(columnIndex));
	}

	private List<String> parse(String json) throws SQLException {
		if (json == null || json.isBlank()) return null;
		try {
			return om.readValue(json, LIST_STRING);
		} catch (Exception e) {
			throw new SQLException("Failed to deserialize JSON string to List<String>", e);
		}
	}
}
