package com.solsol.heycalendar.mapper;

import com.solsol.heycalendar.entity.Application;
import com.solsol.heycalendar.dto.response.ApplicationResponse;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;

/**
 * MyBatis mapper interface for Application entity
 */
@Mapper
public interface ApplicationMapper {

    /**
     * Find all applications
     * @return List of all applications
     */
    List<Application> findAllApplications();

    /**
     * Find applications by user
     * @param userNm User name
     * @return List of applications for the user
     */
    List<Application> findApplicationsByUser(@Param("userNm") String userNm);

    /**
     * Find applications by scholarship
     * @param scholarshipNm Scholarship name
     * @return List of applications for the scholarship
     */
    List<Application> findApplicationsByScholarship(@Param("scholarshipNm") String scholarshipNm);

    /**
     * Find application by user and scholarship
     * @param userNm User name
     * @param scholarshipNm Scholarship name
     * @return Application if found, null otherwise
     */
    Application findApplicationByUserAndScholarship(
            @Param("userNm") String userNm, 
            @Param("scholarshipNm") String scholarshipNm);

    /**
     * Insert a new application
     * @param application Application to insert
     * @return Number of affected rows
     */
    int insertApplication(Application application);

    /**
     * Update an existing application
     * @param application Application to update
     * @return Number of affected rows
     */
    int updateApplication(Application application);

    /**
     * Delete an application
     * @param userNm User name
     * @param scholarshipNm Scholarship name
     * @return Number of affected rows
     */
    int deleteApplication(@Param("userNm") String userNm, @Param("scholarshipNm") String scholarshipNm);

    /**
     * Count applications by state
     * @param state Application state
     * @return Number of applications with the given state
     */
    int countApplicationsByState(@Param("state") String state);

    /**
     * Find applications by state
     * @param state Application state
     * @return List of applications with the given state
     */
    List<Application> findApplicationsByState(@Param("state") String state);

    /**
     * Find applications by user and state
     * @param userNm User name
     * @param state Application state
     * @return List of applications for the user with the given state
     */
    List<Application> findApplicationsByUserAndState(
            @Param("userNm") String userNm, 
            @Param("state") String state);

    /**
     * Find applications by scholarship and state
     * @param scholarshipNm Scholarship name
     * @param state Application state
     * @return List of applications for the scholarship with the given state
     */
    List<Application> findApplicationsByScholarshipAndState(
            @Param("scholarshipNm") String scholarshipNm, 
            @Param("state") String state);

    /**
     * Count total applications
     * @return Total number of applications
     */
    int countTotalApplications();

    /**
     * Count applications by user
     * @param userNm User name
     * @return Number of applications for the user
     */
    int countApplicationsByUser(@Param("userNm") String userNm);

    /**
     * Count applications by scholarship
     * @param scholarshipNm Scholarship name
     * @return Number of applications for the scholarship
     */
    int countApplicationsByScholarship(@Param("scholarshipNm") String scholarshipNm);

    // === New methods for ApplicationResponse with scholarship info ===

    /**
     * Find applications by user with scholarship information
     * @param userNm User name
     * @return List of ApplicationResponse with scholarship details
     */
    List<ApplicationResponse> findApplicationsWithScholarshipByUser(@Param("userNm") String userNm);

    /**
     * Find all applications with scholarship information (Admin)
     * @return List of ApplicationResponse with scholarship details
     */
    List<ApplicationResponse> findAllApplicationsWithScholarship();

    /**
     * Find applications by scholarship with user information
     * @param scholarshipNm Scholarship ID
     * @return List of ApplicationResponse for the scholarship
     */
    List<ApplicationResponse> findApplicationsWithUserByScholarship(@Param("scholarshipNm") Long scholarshipNm);

    /**
     * Find application detail with user and scholarship information
     * @param userNm User name
     * @param scholarshipNm Scholarship name
     * @return ApplicationResponse with detailed information
     */
    ApplicationResponse findApplicationDetailByUserAndScholarship(
            @Param("userNm") String userNm, 
            @Param("scholarshipNm") String scholarshipNm);
}