package org.moera.relay.push.data;

import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

public interface ClientRepository extends JpaRepository<Client, UUID>  {

    @Query("select c from Client c where c.clientId = ?1")
    Optional<Client> findByClientId(String clientId);

}
