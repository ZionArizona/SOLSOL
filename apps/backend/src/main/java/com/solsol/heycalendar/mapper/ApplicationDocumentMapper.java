package com.solsol.heycalendar.mapper;

import com.solsol.heycalendar.entity.ApplicationDocument;
import com.solsol.heycalendar.dto.response.ApplicationDocumentResponse;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;

/**
 * MyBatis mapper interface for ApplicationDocument entity
 */
@Mapper
public interface ApplicationDocumentMapper {

    /**
     * Find all documents
     * @return List of all application documents
     */
    List<ApplicationDocument> findAllDocuments();

    /**
     * Find documents by user and scholarship
     * @param userNm User name
     * @param scholarshipNm Scholarship name
     * @return List of documents for the application
     */
    List<ApplicationDocument> findDocumentsByUserAndScholarship(
            @Param("userNm") String userNm, 
            @Param("scholarshipNm") String scholarshipNm);

    /**
     * Find documents by application (for admin)
     * @param userNm User name
     * @param scholarshipNm Scholarship name
     * @return List of document responses for the application
     */
    List<ApplicationDocumentResponse> findDocumentsByApplication(
            @Param("userNm") String userNm, 
            @Param("scholarshipNm") String scholarshipNm);

    /**
     * Find document by name and application
     * @param documentNm Document name
     * @param userNm User name
     * @param scholarshipNm Scholarship name
     * @return Document if found, null otherwise
     */
    ApplicationDocument findDocumentByNameAndApplication(
            @Param("documentNm") String documentNm,
            @Param("userNm") String userNm, 
            @Param("scholarshipNm") String scholarshipNm);

    /**
     * Find document by document name only
     * @param documentNm Document name
     * @return Document if found, null otherwise
     */
    ApplicationDocument findDocumentByName(@Param("documentNm") String documentNm);

    /**
     * Find documents by user
     * @param userNm User name
     * @return List of documents uploaded by the user
     */
    List<ApplicationDocument> findDocumentsByUser(@Param("userNm") String userNm);

    /**
     * Find documents by scholarship
     * @param scholarshipNm Scholarship name
     * @return List of documents for the scholarship
     */
    List<ApplicationDocument> findDocumentsByScholarship(@Param("scholarshipNm") String scholarshipNm);

    /**
     * Insert a new document
     * @param document Document to insert
     * @return Number of affected rows
     */
    int insertDocument(ApplicationDocument document);

    /**
     * Insert a new application document
     * @param document Application document to insert
     * @return Number of affected rows
     */
    int insertApplicationDocument(ApplicationDocument document);

    /**
     * Update an existing document
     * @param document Document to update
     * @return Number of affected rows
     */
    int updateDocument(ApplicationDocument document);

    /**
     * Delete a document by name and application
     * @param documentNm Document name
     * @param userNm User name
     * @param scholarshipNm Scholarship name
     * @return Number of affected rows
     */
    int deleteDocument(
            @Param("documentNm") String documentNm,
            @Param("userNm") String userNm, 
            @Param("scholarshipNm") String scholarshipNm);

    /**
     * Delete all documents for an application
     * @param userNm User name
     * @param scholarshipNm Scholarship name
     * @return Number of affected rows
     */
    int deleteDocumentsByApplication(
            @Param("userNm") String userNm, 
            @Param("scholarshipNm") String scholarshipNm);

    /**
     * Count documents by user and scholarship
     * @param userNm User name
     * @param scholarshipNm Scholarship name
     * @return Number of documents for the application
     */
    int countDocumentsByUserAndScholarship(
            @Param("userNm") String userNm, 
            @Param("scholarshipNm") String scholarshipNm);

    /**
     * Count documents by user
     * @param userNm User name
     * @return Number of documents uploaded by the user
     */
    int countDocumentsByUser(@Param("userNm") String userNm);

    /**
     * Count documents by scholarship
     * @param scholarshipNm Scholarship name
     * @return Number of documents for the scholarship
     */
    int countDocumentsByScholarship(@Param("scholarshipNm") String scholarshipNm);

    /**
     * Count total documents
     * @return Total number of documents
     */
    int countTotalDocuments();

    /**
     * Find documents by content type
     * @param contentType Content type (MIME type)
     * @return List of documents with the given content type
     */
    List<ApplicationDocument> findDocumentsByContentType(@Param("contentType") String contentType);

    /**
     * Find documents larger than specified size
     * @param fileSize File size threshold in bytes
     * @return List of documents larger than the specified size
     */
    List<ApplicationDocument> findDocumentsLargerThan(@Param("fileSize") Long fileSize);

    /**
     * Find documents uploaded within date range
     * @param startDate Start date (inclusive)
     * @param endDate End date (inclusive)
     * @return List of documents uploaded within the date range
     */
    List<ApplicationDocument> findDocumentsByDateRange(
            @Param("startDate") String startDate,
            @Param("endDate") String endDate);
}