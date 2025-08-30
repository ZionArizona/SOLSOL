package com.solsol.heycalendar.config;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.solsol.heycalendar.dto.response.ScholarshipResponse;
import org.apache.ibatis.type.BaseTypeHandler;
import org.apache.ibatis.type.JdbcType;
import org.apache.ibatis.type.MappedJdbcTypes;
import org.apache.ibatis.type.MappedTypes;

import java.sql.*;
import java.util.List;

@MappedTypes(List.class)
@MappedJdbcTypes({JdbcType.VARCHAR, JdbcType.LONGVARCHAR, JdbcType.OTHER})
public class RequiredDocumentsTypeHandler
	extends BaseTypeHandler<List<ScholarshipResponse.RequiredDocumentDto>> {

	private static final ObjectMapper om = new ObjectMapper();
	private static final TypeReference<List<ScholarshipResponse.RequiredDocumentDto>> TYPE =
		new TypeReference<>() {};

	@Override
	public void setNonNullParameter(PreparedStatement ps, int i,
		List<ScholarshipResponse.RequiredDocumentDto> parameter,
		JdbcType jdbcType) throws SQLException {
		try {
			ps.setString(i, om.writeValueAsString(parameter));
		} catch (Exception e) {
			throw new SQLException("Failed to serialize requiredDocuments", e);
		}
	}

	@Override
	public List<ScholarshipResponse.RequiredDocumentDto> getNullableResult(ResultSet rs, String columnName) throws SQLException {
		return parse(rs.getString(columnName));
	}

	@Override
	public List<ScholarshipResponse.RequiredDocumentDto> getNullableResult(ResultSet rs, int columnIndex) throws SQLException {
		return parse(rs.getString(columnIndex));
	}

	@Override
	public List<ScholarshipResponse.RequiredDocumentDto> getNullableResult(CallableStatement cs, int columnIndex) throws SQLException {
		return parse(cs.getString(columnIndex));
	}

	private List<ScholarshipResponse.RequiredDocumentDto> parse(String json) throws SQLException {
		if (json == null || json.isBlank()) return null;
		try {
			return om.readValue(json, TYPE);
		} catch (Exception e) {
			throw new SQLException("Failed to deserialize requiredDocuments", e);
		}
	}
}
