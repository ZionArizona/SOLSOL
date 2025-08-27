package com.solsol.heycalendar.config;

import java.sql.CallableStatement;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;

import org.apache.ibatis.type.BaseTypeHandler;
import org.apache.ibatis.type.JdbcType;
import org.apache.ibatis.type.MappedTypes;

import com.solsol.heycalendar.entity.ApplicationState;

@MappedTypes(ApplicationState.class)
public class ApplicationStateTypeHandler extends BaseTypeHandler<ApplicationState> {

    @Override
    public void setNonNullParameter(PreparedStatement ps, int i, ApplicationState parameter, JdbcType jdbcType) throws SQLException {
        ps.setString(i, parameter.name().toLowerCase());
    }

    @Override
    public ApplicationState getNullableResult(ResultSet rs, String columnName) throws SQLException {
        String value = rs.getString(columnName);
        if (value == null) {
            return null;
        }
        return ApplicationState.valueOf(value.toUpperCase());
    }

    @Override
    public ApplicationState getNullableResult(ResultSet rs, int columnIndex) throws SQLException {
        String value = rs.getString(columnIndex);
        if (value == null) {
            return null;
        }
        return ApplicationState.valueOf(value.toUpperCase());
    }

    @Override
    public ApplicationState getNullableResult(CallableStatement cs, int columnIndex) throws SQLException {
        String value = cs.getString(columnIndex);
        if (value == null) {
            return null;
        }
        return ApplicationState.valueOf(value.toUpperCase());
    }
}