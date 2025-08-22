package com.solsol.heycalendar.mapper;

import com.solsol.heycalendar.domain.Exchange;
import com.solsol.heycalendar.domain.ExchangeState;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;

/**
 * Exchange MyBatis mapper interface
 */
@Mapper
public interface ExchangeMapper {
    
    /**
     * Insert new exchange record
     *
     * @param exchange Exchange entity
     * @return Number of affected rows
     */
    int insert(Exchange exchange);
    
    /**
     * Update exchange record
     *
     * @param exchange Exchange entity
     * @return Number of affected rows
     */
    int update(Exchange exchange);
    
    /**
     * Find exchange record by primary key
     *
     * @param exchangeNm Exchange name (primary key)
     * @return Exchange record
     */
    Exchange findById(@Param("exchangeNm") String exchangeNm);
    
    /**
     * Find exchange records by user name
     *
     * @param userNm User name
     * @return List of exchange records
     */
    List<Exchange> findByUserNm(@Param("userNm") String userNm);
    
    /**
     * Find all exchange records
     *
     * @return List of all exchange records
     */
    List<Exchange> findAll();
    
    /**
     * Find exchange records by state
     *
     * @param state Exchange state
     * @return List of exchange records
     */
    List<Exchange> findByState(@Param("state") ExchangeState state);
    
    /**
     * Find exchange records by user name and state
     *
     * @param userNm User name
     * @param state Exchange state
     * @return List of exchange records
     */
    List<Exchange> findByUserNmAndState(@Param("userNm") String userNm, @Param("state") ExchangeState state);
    
    /**
     * Calculate total exchange amount by user name and state
     *
     * @param userNm User name
     * @param state Exchange state
     * @return Total exchange amount
     */
    Integer calculateTotalByUserNmAndState(@Param("userNm") String userNm, @Param("state") ExchangeState state);
}