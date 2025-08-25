package com.solsol.heycalendar.mapper;

import org.apache.ibatis.annotations.Mapper;

import com.solsol.heycalendar.domain.MyboxAudit;

@Mapper
public interface MyboxAuditMapper {
	int insert(MyboxAudit audit);
}
