package com.aqs.crm.product.service;

import com.aqs.crm.common.exception.ConflictException;
import com.aqs.crm.common.exception.ResourceNotFoundException;
import com.aqs.crm.product.dto.ProductCreateRequest;
import com.aqs.crm.product.dto.ProductDto;
import com.aqs.crm.product.entity.Product;
import com.aqs.crm.product.repository.ProductRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Slf4j
@RequiredArgsConstructor
public class ProductService {

    private final ProductRepository productRepository;

    @Transactional(readOnly = true)
    public List<ProductDto> getAllProducts() {
        return productRepository.findByIsActiveTrue().stream()
                .map(this::toDto)
                .toList();
    }

    @Transactional(readOnly = true)
    public ProductDto getById(Long id) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product", "id", id));
        return toDto(product);
    }

    @Transactional
    public ProductDto create(ProductCreateRequest request) {
        if (productRepository.existsByName(request.name())) {
            throw new ConflictException("Product with name '" + request.name() + "' already exists");
        }

        Product product = Product.builder()
                .name(request.name())
                .description(request.description())
                .currentVersion(request.currentVersion())
                .annualPrice(request.annualPrice())
                .isActive(true)
                .build();

        product = productRepository.save(product);
        log.info("Created product: {} (id={})", product.getName(), product.getId());
        return toDto(product);
    }

    @Transactional
    public ProductDto update(Long id, ProductCreateRequest request) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product", "id", id));

        productRepository.findByName(request.name())
                .filter(existing -> !existing.getId().equals(id))
                .ifPresent(existing -> {
                    throw new ConflictException("Product with name '" + request.name() + "' already exists");
                });

        product.setName(request.name());
        product.setDescription(request.description());
        product.setCurrentVersion(request.currentVersion());
        product.setAnnualPrice(request.annualPrice());

        product = productRepository.save(product);
        log.info("Updated product: {} (id={})", product.getName(), product.getId());
        return toDto(product);
    }

    @Transactional
    public void deactivate(Long id) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product", "id", id));
        product.setActive(false);
        productRepository.save(product);
        log.info("Deactivated product: {} (id={})", product.getName(), product.getId());
    }

    private ProductDto toDto(Product product) {
        return new ProductDto(
                product.getId(),
                product.getName(),
                product.getDescription(),
                product.getCurrentVersion(),
                product.getAnnualPrice(),
                product.isActive(),
                product.getCreatedAt()
        );
    }
}
