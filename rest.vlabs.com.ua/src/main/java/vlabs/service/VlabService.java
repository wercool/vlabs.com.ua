package vlabs.service;

import java.util.List;

import vlabs.model.Vlab;

public interface VlabService
{
    Vlab findById(Long id);
    Vlab findByTitle(String title);
    List<Vlab> findAll();
}
