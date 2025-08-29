package com.solsol.heycalendar.mapper;

import com.solsol.heycalendar.entity.Mybox;
import org.apache.ibatis.annotations.*;

import java.util.List;

@Mapper
public interface MyboxMapper {

    @Insert("""
            INSERT INTO mybox (userNm, object_key_enc, file_name_enc, content_type, size_bytes, checksum_sha256)
            VALUES (#{userNm}, #{objectKeyEnc}, #{fileNameEnc}, #{contentType}, #{sizeBytes}, #{checksumSha256})
            """)
    @Options(useGeneratedKeys = true, keyProperty = "id")
    void insertDocument(Mybox mybox);

    @Select("""
            SELECT id, userNm, object_key_enc as objectKeyEnc, file_name_enc as fileNameEnc, 
                   content_type as contentType, size_bytes as sizeBytes, checksum_sha256 as checksumSha256,
                   created_at as createdAt, updated_at as updatedAt
            FROM mybox 
            WHERE userNm = #{userNm} 
            ORDER BY created_at DESC
            """)
    List<Mybox> findByUserNm(String userNm);

    @Select("""
            SELECT id, userNm, object_key_enc as objectKeyEnc, file_name_enc as fileNameEnc, 
                   content_type as contentType, size_bytes as sizeBytes, checksum_sha256 as checksumSha256,
                   created_at as createdAt, updated_at as updatedAt
            FROM mybox 
            WHERE id = #{id} AND userNm = #{userNm}
            """)
    Mybox findByIdAndUserNm(@Param("id") Long id, @Param("userNm") String userNm);

    @Delete("DELETE FROM mybox WHERE id = #{id}")
    void deleteById(Long id);

    @Insert("""
            INSERT INTO mybox_audit (mybox_id, actor_userNm, action, object_key_enc, file_name_enc)
            VALUES (#{myboxId}, #{actorUserNm}, #{action}, #{objectKeyEnc}, #{fileNameEnc})
            """)
    void insertAuditLog(@Param("myboxId") Long myboxId, 
                       @Param("actorUserNm") String actorUserNm, 
                       @Param("action") String action,
                       @Param("objectKeyEnc") byte[] objectKeyEnc,
                       @Param("fileNameEnc") byte[] fileNameEnc);
}
