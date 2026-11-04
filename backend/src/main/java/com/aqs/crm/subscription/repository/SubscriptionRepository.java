package com.aqs.crm.subscription.repository;

import com.aqs.crm.subscription.entity.Subscription;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface SubscriptionRepository extends JpaRepository<Subscription, Long> {

    List<Subscription> findByCompanyId(Long companyId);

    Optional<Subscription> findByIdAndCompanyId(Long id, Long companyId);

    boolean existsByCompanyIdAndProductId(Long companyId, Long productId);
}

