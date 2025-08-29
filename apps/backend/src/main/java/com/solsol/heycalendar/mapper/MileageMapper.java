package com.solsol.heycalendar.mapper;

import com.solsol.heycalendar.domain.Mileage;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;

/**
 * Mileage MyBatis mapper interface
 */
@Mapper
public interface MileageMapper {
    
    /**
     * Insert new mileage record
     *
     * @param mileage Mileage entity
     * @return Number of affected rows
     */
    int insert(Mileage mileage);
    
    /**
     * Find mileage records by user name
     *
     * @param userNm User name
     * @return List of mileage records
     */
    List<Mileage> findByUserNm(@Param("userNm") String userNm);
    
    /**
     * Find mileage record by primary key
     *
     * @param key Primary key
     * @return Mileage record
     */
    Mileage findById(@Param("key") Long key);
    
    /**
     * Find all mileage records
     *
     * @return List of all mileage records
     */
    List<Mileage> findAll();
    
    /**
     * Calculate total mileage for a user
     *
     * @param userNm User name
     * @return Total mileage amount
     */
    Integer calculateTotalByUserNm(@Param("userNm") String userNm);
    
    /**
     * Check if mileage has been paid for specific scholarship application
     *
     * @param userNm User name
     * @param scholarshipNm Scholarship ID
     * @return Mileage record if exists, null otherwise
     */
    Mileage findByUserNmAndScholarshipNm(@Param("userNm") String userNm, @Param("scholarshipNm") Long scholarshipNm);
    
    /**
     * Check if user has received mileage for a scholarship
     *
     * @param userNm User name
     * @param scholarshipNm Scholarship ID
     * @return true if mileage already paid, false otherwise
     */
    boolean existsByUserNmAndScholarshipNm(@Param("userNm") String userNm, @Param("scholarshipNm") Long scholarshipNm);
}