package com.aqs.crm.contact.repository;

import com.aqs.crm.contact.entity.Contact;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ContactRepository extends JpaRepository<Contact, Long> {

    List<Contact> findByCompanyId(Long companyId);

    List<Contact> findByCompanyIdAndIsBillingTrue(Long companyId);

    List<Contact> findByOptedInGreetingsTrueAndEmailIsNotNull();

    Optional<Contact> findByUnsubscribeToken(String unsubscribeToken);

    Optional<Contact> findByIdAndCompanyId(Long id, Long companyId);
}

