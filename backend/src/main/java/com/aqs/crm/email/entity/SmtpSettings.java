package com.aqs.crm.email.entity;

import com.aqs.crm.common.entity.BaseEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "smtp_settings")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SmtpSettings extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    @Builder.Default
    private String host = "smtpout.secureserver.net";

    @Column(nullable = false)
    @Builder.Default
    private Integer port = 587;

    @Column(nullable = false, length = 20)
    @Builder.Default
    private String protocol = "smtp";

    @Column(length = 255)
    private String username;

    @Column(length = 500)
    private String password;

    @Column(name = "from_email", length = 255)
    private String fromEmail;

    @Column(name = "from_name", length = 255)
    @Builder.Default
    private String fromName = "AQS Renewal CRM";

    @Column(name = "starttls_enabled", nullable = false)
    @Builder.Default
    private Boolean starttlsEnabled = true;

    @Column(name = "ssl_enabled", nullable = false)
    @Builder.Default
    private Boolean sslEnabled = false;

    @Column(name = "is_active", nullable = false)
    @Builder.Default
    private Boolean isActive = true;
}

